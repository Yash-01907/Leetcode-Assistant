import React, { useEffect, useState } from "react";
import TabbedInterface from "../components/TabbedInterface";


function PopUp() {
  const [problemSlug, setProblemSlug] = useState('');
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
            setProblemSlug('Not on a LeetCode problem page.');
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
      console.log(problemSlug)
      fetchGuidance(problemSlug);
    } else if (problemSlug === 'Not on a LeetCode problem page.') {
      setIsLoading(false); // Stop loading if not on a problem page
    }
  }, [problemSlug]); // Rerun when slug changes

  const fetchGuidance = async (slug) => {
    setIsLoading(true);
    setError(null);
    const BACKEND_URL = "http://localhost:3000/api/guidance"; // Adjust URL

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problemSlug: slug }),
      });

      if (!response.ok) {
        throw new Error('Backend failed to fetch or generate guidance.');
      }

      const data = await response.json();
      setGuidance(data);

      // Optional: Store the entire fetched guidance data in chrome.storage.local here
      // This caches the data locally for instant access the next time the user opens the popup.

    } catch (err) {
      console.error(err);
      setError("Error loading guidance. Please check the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ width: 300, padding: 20 }}>Loading guidance... ⏳</div>;
  }
  if (error) {
    return <div style={{ width: 300, padding: 20, color: 'red' }}>Error: {error}</div>;
  }
  if (!problemSlug || !guidance) {
     return <div style={{ width: 300, padding: 20 }}>Please navigate to a LeetCode problem page.</div>;
  }

  // Pass guidance data down to the Tab component
  return (
    <div style={{ width: 450, padding: 10 }}>
        <h1>LeetCode Assistant: {problemSlug}</h1>
        <TabbedInterface guidance={guidance} problemSlug={problemSlug}/> 
    </div>
  );
}
// ...

export default PopUp;
