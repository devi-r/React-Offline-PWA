// This function registers the service worker.
export function register() {
  // Check if service workers are supported by the browser
  if ("serviceWorker" in navigator) {
    // The 'load' event fires when the page and all its resources are fully loaded.
    // It's a good time to register the worker without delaying the initial page render.
    window.addEventListener("load", () => {
      const swUrl = "/service-worker.js";
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    });
  } else {
    console.log("Service Workers are not supported in this browser.");
  }
}

// This function can be used to unregister the service worker if needed.
export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
