import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [articles, setArticles] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = "https://dummyjson.com/posts";

    setLoading(true);
    fetch(apiUrl)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        const source = res.headers.get("X-Source") || "network";
        setSource(source);
        const data = await res.json();
        setArticles(data.posts);
        setStatus("");
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setStatus("Failed to load articles. Try again online.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Offline Article Viewer</h1>
        <p>
          This page is powered by a Service Worker and will work even when you
          are offline.
        </p>
        {source && (
          <div className={`source-indicator source-${source}`}>
            Data source: <strong>{source}</strong>
          </div>
        )}
      </header>
      <main className="content">
        {status && <p className="status">{status}</p>}
        {loading ? (
          <p>Loading articles...</p>
        ) : (
          articles.map((article) => (
            <article key={article.id} className="card">
              <h2>{article.title}</h2>
              <p>{article.body}</p>
            </article>
          ))
        )}
      </main>
    </div>
  );
}

export default App;
