function getProblemSlug() {
  const path = window.location.pathname;

  const match = path.match(/^\/problems\/([^\/]+)/);
  console.log(match);

  if (match && match[1]) {
    return match[1];
  }
  return null;
}


// src/content-script/problemDetector.js

// ... (Keep your existing getProblemSlug function) ...

let currentSlug = null;

function detectAndSend() {
    const newSlug = getProblemSlug();

    // Only send a message if the slug is new or has changed
    if (newSlug && newSlug !== currentSlug) {
        currentSlug = newSlug;
        console.log("Detected new Problem Slug:", currentSlug);
        
        chrome.runtime.sendMessage({
            action: "problemDetected",
            data: { slug: currentSlug }
        });
        
        // You'll need logic here to trigger the popup to reload/fetch guidance
    }
}

// 1. Initial detection on load
detectAndSend();

// 2. Observer for SPA navigation (Watches for URL changes via the title)
const observer = new MutationObserver((mutations) => {
    // Check if the document title changed (common proxy for LeetCode navigation)
    if (mutations.some(m => m.target.nodeName === 'TITLE')) {
        detectAndSend();
    }
});

// Start observing the document title and body for general changes
observer.observe(document.head, { childList: true, subtree: true });
observer.observe(document.body, { childList: true, subtree: true });


// 3. Listener to respond to the Popup opening (Keep this)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "detectProblem") {
        sendResponse({ slug: getProblemSlug() });
        return true; 
    }
});