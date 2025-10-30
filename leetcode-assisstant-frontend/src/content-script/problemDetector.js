function getProblemSlug() {
  const path = window.location.pathname;

  const match = path.match(/^\/problems\/([^\/]+)/);

  if (match && match[1]) {
    return match[1];
  }
  return null;
}



let currentSlug = null;

function detectAndSend() {
    const newSlug = getProblemSlug();

    // Only send a message if the slug is new or has changed
    if (newSlug && newSlug !== currentSlug) {
        currentSlug = newSlug;
        console.log("Detected new Problem Slug:", currentSlug);
        
        try {
            chrome.runtime.sendMessage({
                action: "problemDetected",
                data: { slug: currentSlug }
            });
        } catch (error) {
            console.warn("Failed to send message to extension:", error);
        }
        
        // You'll need logic here to trigger the popup to reload/fetch guidance
    }
}

// 1. Initial detection on load
detectAndSend();

// 2. Observer for SPA navigation (Watches for URL changes via the title)
let throttleTimer = null;
const observer = new MutationObserver((mutations) => {
    // Throttle to prevent excessive calls
    if (throttleTimer) return;
    
    // Check if the document title changed (common proxy for LeetCode navigation)
    if (mutations.some(m => m.target.nodeName === 'TITLE')) {
        throttleTimer = setTimeout(() => {
            detectAndSend();
            throttleTimer = null;
        }, 100);
    }
});

// Only observe document title for better performance
observer.observe(document.head, { childList: true, subtree: false });


// 3. Listener to respond to the Popup opening (Keep this)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "detectProblem") {
        sendResponse({ slug: getProblemSlug() });
        return true; 
    }
});