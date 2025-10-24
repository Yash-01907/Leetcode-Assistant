function getProblemSlug() {
  const path = window.location.pathname;

  const match = path.match(/^\/problems\/([^\/]+)/);

  if (match && match[1]) {
    return match[1];
  }
  return null;
}

function sendProblemData() {
  const slug = getProblemSlug();

  if (slug) {
    console.log("Detected Problem Slug:", slug);

    // Send a message to the rest of the extension (Popup, Service Worker)
    chrome.runtime.sendMessage({
      action: "problemDetected",
      data: { slug: slug },
    });
  } else {
    console.log("Not on a LeetCode problem page.");
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "detectProblem") {
    const slug = getProblemSlug();
    sendResponse({ slug: slug });
    return true;
  }
});
