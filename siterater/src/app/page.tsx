'use client';  // This is to ensure the code runs in the client-side context

import { useState } from 'react';

const SiteRatingPage = () => {
  const [url, setUrl] = useState('');
  const [ratingData, setRatingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/rate-site?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (res.ok) {
        setRatingData(data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to fetch data from the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Website Rating and Analysis</h1>
      
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a website URL"
          className="input"
        />
        <button type="submit" className="submit-btn">
          Analyze Website
        </button>
      </form>

      {loading && <p>Loading...</p>}

      {error && <p className="error">{error}</p>}

      {ratingData && (
        <div className="results">
          <h2>Results for {url}</h2>
          <div className="card">
            <h3>Design Rating</h3>
            <p>{ratingData.designRating}</p>
          </div>

          <div className="card">
            <h3>SEO Rating</h3>
            <p>{ratingData.seoRating}</p>
          </div>

          <div className="card">
            <h3>Content Quality Rating</h3>
            <p>{ratingData.contentRating}</p>
          </div>

          <div className="card">
            <h3>Overall Rating</h3>
            <p>{ratingData.overallRating.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteRatingPage;
