import React, { useEffect, useState } from "react";

function PopUp() {
  const [problemSlug, setProblemSlug] = useState("Loading...");

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(
          activeTab.id,
          { action: "detectProblem" },
          (response) => {
            if (response && response.slug) {
              setProblemSlug(response.slug);
            } else {
              setProblemSlug("No problem detected");
            }
          }
        );
      });
    } else {
      setProblemSlug("Chrome API not available");
    }
  }, []);

  return (
    <div style={{ width: 300, padding: 10 }}>
      <h1>LeetCode Assistant</h1>
      <p>Current Problem Slug: <strong>{problemSlug}</strong></p>
      {/* Placeholder for your Tabbed UI (Phase 3) */}
      <div style={{ borderTop: '1px solid #ccc', marginTop: 10, paddingTop: 10 }}>
        <p>Hints | Approach | Solution (Tabs will go here)</p>
      </div>
    </div>
  );
}

export default PopUp;
