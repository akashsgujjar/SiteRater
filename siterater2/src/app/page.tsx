'use client';

import { useState } from 'react';

interface WebsiteAnalysis {
  overallScore: number;
  categories: {
    design: number;
    content: number;
    performance: number;
    accessibility: number;
    seo: number;
  };
  feedback: string;
  recommendations: string[];
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [isRoastMode, setIsRoastMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/rate-site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, mode: isRoastMode ? 'roast' : 'professional' }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze website');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Website Rater
          </h1>
          
          {/* Mode Switch */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 text-sm font-medium ${!isRoastMode ? 'text-indigo-600' : 'text-gray-500'}`}>
              Professional
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isRoastMode}
              onClick={() => setIsRoastMode(!isRoastMode)}
              className={`${
                isRoastMode ? 'bg-indigo-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  isRoastMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
            <span className={`ml-3 text-sm font-medium ${isRoastMode ? 'text-indigo-600' : 'text-gray-500'}`}>
              Roast Mode
            </span>
          </div>

          <p className="text-lg text-gray-600 mb-8">
            {isRoastMode 
              ? "Enter a URL to get a brutally honest (and funny) roast of the website's design and content."
              : "Enter a URL to get an AI-powered analysis of the website&apos;s design, content, performance, accessibility, and SEO."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <div className="mt-1">
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : isRoastMode ? 'Roast Website' : 'Analyze Website'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="mt-8 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Overall Score
                </h2>
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full border-8 border-indigo-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-indigo-600">
                      {analysis.overallScore}
                    </span>
                  </div>
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-indigo-600"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + (analysis.overallScore * 3.6)}% 0%, ${50 + (analysis.overallScore * 3.6)}% 100%, 50% 100%)`,
                      transform: 'rotate(-90deg)'
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.entries(analysis.categories).map(([category, score]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-700 capitalize">
                        {category}
                      </h3>
                      <span className="text-lg font-bold text-indigo-600">
                        {score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-indigo-900 mb-3">
                    {isRoastMode ? 'The Roast' : 'Detailed Feedback'}
                  </h3>
                  <p className="text-indigo-800 leading-relaxed">
                    {analysis.feedback}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {isRoastMode ? 'How to Not Get Roasted' : 'Recommendations'}
                  </h3>
                  <ul className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
