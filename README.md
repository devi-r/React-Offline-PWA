# React Offline PWA (with Service Worker)

This project is a demonstration of an offline-first web application built with React and a custom Service Worker. It showcases how a web app can provide a seamless user experience, even without a network connection, by intelligently caching application assets and API data.

## Demo

**Live Preview:** https://react-offline-pwa.onrender.com

✅ **Fully functional offline support** - Test it by loading the site online, then turning off your WiFi and refreshing!


🚀 This project was developed by **[Devi R](https://www.linkedin.com/in/devi-r-06bb94a7)** with AI-assistance, demonstrating a powerful human-AI collaboration for solving complex web development challenges.

## Features

- **Progressive Web App (PWA):** Includes a `manifest.json` and a registered Service Worker, making it installable on user devices.
- **Dynamic Content:** On each page load, the app requests a new, random set of 10 articles from the `dummyjson.com` API.
- **On-the-Fly Shuffling for Clarity:** To make the caching behavior unmistakably clear, the service worker intercepts the live API response and **shuffles the order** of the articles. This was implemented because an API can sometimes return data in the same order, and shuffling guarantees a visually different result on each network refresh.
- **Robust Offline Experience:** Uses a "Network-First, falling back to Cache" strategy for API data. When offline, it serves the last successfully fetched and shuffled set of articles from the cache.
- **Clear Data Source Indicator:** A UI element at the top of the page clearly indicates whether the displayed data is coming from the live `network` or the local `cache`.
- **Production-Ready Deployment:** Successfully deployed and tested on Render, Netlify, and other platforms with full offline functionality.

## How It Works

The application's offline capabilities are orchestrated by the interaction between the React app and the Service Worker.

### The React App (`src/App.js`)

- On component mount, it constructs a URL with random parameters (`limit` and `skip`) to fetch a unique set of articles.
- It initiates a `fetch` request for this URL.
- It inspects the `X-Source` header of the response (provided by the service worker) to determine where the data came from.
- It renders the articles and the data source indicator.

### The Service Worker (`public/service-worker.js`)

The service worker acts as a programmable proxy, managing network requests and caching.

1.  **App Shell Caching:** On installation, the service worker pre-caches the main application "shell" (HTML, CSS, JavaScript files), ensuring the app itself can load instantly and offline. This is a "Cache-First" strategy.

2.  **Navigation Request Handling:** The service worker specifically handles navigation requests (when users type the URL directly) to ensure the app loads properly even when offline.

3.  **API Data Caching:** The service worker uses a more complex "Network-First" strategy for API calls:
    - It listens for any `fetch` event that matches the article API's URL.
    - **Network Attempt:** It always tries to fetch a fresh response from the network first.
    - **Shuffle on Success:** If the network request is successful:
      - It reads the JSON body of the response.
      - It **shuffles the array of posts** using a Fisher-Yates algorithm.
      - It creates a brand-new `Response` object containing the shuffled data.
      - It adds the custom `X-Source: network` header to this new response.
      - It puts a copy of the **shuffled response** into a dedicated data cache.
      - It returns the shuffled response to the React app.
    - **Cache on Failure:** If the network request fails (e.g., the user is offline), the service worker retrieves the last successfully saved (and already shuffled) response from the cache, adds the `X-Source: cache` header, and returns it to the app.

## Getting Started

To run this project locally, you'll need Node.js and npm installed.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd react-offline-pwa
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start the development server:**
    ```bash
    npm start
    ```
    The app will be available at `http://localhost:3000`.

## How to Test Offline Mode

The offline functionality has been tested and works reliably. Here's how to test it:

### Simple Test (Recommended)

1. **Load Online First:**

   - Open the app in your browser
   - Wait for it to fully load (you'll see "Data source: network")
   - Notice the shuffled articles

2. **Test Offline:**
   - Turn off your WiFi or disconnect from the internet
   - Refresh the page
   - You should see the cached version with "Data source: cache"

### Using Browser DevTools

1. Open **DevTools** (`F12` or `Cmd+Opt+I`)
2. Go to **Network** tab
3. Select **"Offline"** from the throttling dropdown
4. Refresh the page

### Expected Behavior

- **Online:** "Data source: network" + articles shuffle on each refresh
- **Offline:** "Data source: cache" + last cached articles remain visible

## Deployment

This PWA has been successfully deployed and tested on multiple platforms:

- **Render:** https://react-offline-pwa.onrender.com
- **Netlify:** https://react-offline-pwa.netlify.app

The build process automatically generates a production-ready service worker with the correct file paths for caching.
