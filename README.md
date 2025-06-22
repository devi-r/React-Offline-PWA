# React Offline PWA (with Service Worker)

This project is a demonstration of an offline-first web application built with React and a custom Service Worker. It showcases how a web app can provide a seamless user experience, even without a network connection, by intelligently caching application assets and API data.

## Demo

Live Preview: https://react-offline-pwa.onrender.com

**This project was developed with AI-assistance, demonstrating a powerful human-AI collaboration for solving complex web development challenges.**

## Features

- **Progressive Web App (PWA):** Includes a `manifest.json` and a registered Service Worker, making it installable on user devices.
- **Dynamic Content:** On each page load, the app requests a new, random set of 10 articles from the `dummyjson.com` API.
- **On-the-Fly Shuffling for Clarity:** To make the caching behavior unmistakably clear, the service worker intercepts the live API response and **shuffles the order** of the articles. This was implemented because an API can sometimes return data in the same order, and shuffling guarantees a visually different result on each network refresh.
- **Robust Offline Experience:** Uses a "Network-First, falling back to Cache" strategy for API data. When offline, it serves the last successfully fetched and shuffled set of articles from the cache.
- **Clear Data Source Indicator:** A UI element at the top of the page clearly indicates whether the displayed data is coming from the live `network` or the local `cache`.

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

2.  **API Data Caching:** The service worker uses a more complex "Network-First" strategy for API calls:
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

You can simulate offline mode using Chrome DevTools, but for the most accurate behavior, it's best to disable the network entirely. Here's how to test it properly:

---

### 1. **Test in Online Mode**

1. Open the application in Chrome (`http://localhost:3000`).
2. Open **DevTools** (`F12` or `Cmd+Opt+I`).
3. Go to the **Application** tab → **Service Workers**.
4. Enable **`Update on reload`** to ensure the latest service worker code is used.
5. Go to the **Network** tab.
6. Enable **`Disable cache`** to ensure your service worker handles all caching.
7. Refresh the page a few times.

   You should see:

   - **"Data source: network"**
   - Articles re-shuffle on each refresh

---

### 2. **Test in Offline Mode**

> ⚠️ **Note:** Chrome's `Offline` checkbox under the **Application > Service Workers** panel is unreliable for simulating full offline behavior. Use one of the methods below instead.

---

#### Recommended: Simulate Offline via Network Tab

1. Go to the **Network** tab in DevTools.
2. From the **Throttling** dropdown, select **`Offline`**.
3. Refresh the page.

   You should see:

   - **"Data source: cache"**
   - Last loaded articles still visible

---

#### Alternative: Disable Internet Connection

- Turn off Wi-Fi or disconnect your network completely.
- Refresh the page.

  Expected behavior:

  - No network requests are made
  - App loads entirely from service worker cache

---
