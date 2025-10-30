import React, { useEffect, useState } from "react";
import TabbedInterface from "../components/TabbedInterface";

function PopUp() {
  const [problemSlug, setProblemSlug] = useState("");
  const [guidance, setGuidance] = useState(null); // null, then { hints: [], approach: '...', ... }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get the problem slug from the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "detectProblem" },
          (response) => {
            if (response && response.slug) {
              setProblemSlug(response.slug);
            } else {
              setProblemSlug("Not on a LeetCode problem page.");
            }
          }
        );
      }
    });
  }, []);

  // ... useEffect for getting the problem slug from the Content Script (MVE logic) ...

  useEffect(() => {
    // Check if we have a slug and haven't fetched data yet
    if (problemSlug) {
      console.log(problemSlug);
      fetchGuidance(problemSlug);
    } else if (problemSlug === "Not on a LeetCode problem page.") {
      setIsLoading(false); // Stop loading if not on a problem page
    }
  }, [problemSlug]); // Rerun when slug changes

  const BACKEND_URL = "http://localhost:3000/api/guidance"; // Adjust URL
  const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

  const fetchGuidance = async (slug) => {
    setIsLoading(true);
    setError(null);

    try {
      const cachedData = await chrome.storage.local.get([slug]);
      const storedItem = cachedData[slug];

      if (
        storedItem &&
        Date.now() - storedItem.timestamp < CACHE_EXPIRATION_TIME
      ) {
        // Cache Hit: Data is valid and recent
        console.log(`Cache HIT for ${slug}. Loading from local storage.`);
        console.log(storedItem)
        setGuidance(storedItem.data);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn(
        "Could not access chrome.storage.local. Proceeding to network fetch."
      );
    }

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ problemSlug: slug }),
      });

      if (!response.ok) {
        throw new Error("Backend failed to fetch or generate guidance.");
      }

      const data = await response.json();
      setGuidance(data);
      try {
        const itemToStore = {
          data: data,
          timestamp: Date.now(),
        };

        await chrome.storage.local.set({ [slug]: itemToStore });
        console.log(
          `Successfully stored data for ${slug} in chrome.storage.local`
        );
      } catch (storageError) {
        console.error("Failed to store in chrome.storage.local:", storageError);
      }

      // Verify storage worked
      chrome.storage.local.get([slug], (result) => {
        console.log(`Verification - stored data for ${slug}:`, result);
      });
    } catch (err) {
      console.error(err);
      setError("Error loading guidance. Please check the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ width: 300, padding: 20 }}>Loading guidance... ⏳</div>
    );
  }
  if (error) {
    return (
      <div style={{ width: 300, padding: 20, color: "red" }}>
        Error: {error}
      </div>
    );
  }
  if (!problemSlug || !guidance) {
    return (
      <div style={{ width: 300, padding: 20 }}>
        Please navigate to a LeetCode problem page.
      </div>
    );
  }

  // Pass guidance data down to the Tab component
  return (
    <div style={{ width: 450, padding: 10 }}>
      <h1>LeetCode Assistant: {problemSlug}</h1>
      <TabbedInterface guidance={guidance} problemSlug={problemSlug} />
    </div>
  );
}
// ...

export default PopUp;
