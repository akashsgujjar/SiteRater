'use client';  // This is to ensure the code runs in the client-side context

import { useState } from 'react';

interface RatingData {
  status: number;
  title: string;
  images: number;
  buttons: number;
  designRating: number;
  designFeedback: string;
  seoRating: number;
  seoFeedback: string;
  contentRating: number;
  contentFeedback: string;
  overallRating: number;
  overallFeedback: string;
}

const SiteRatingPage = () => {
  const [url, setUrl] = useState('');
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
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
      const res = await fetch('/api/rate-site?url=' + encodeURIComponent(url), {
        method: 'GET',
      });

      const data = await res.json();

      if (res.ok) {
        setRatingData(data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to fetch data from the server');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-emerald-500';
    if (rating >= 6) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getRatingBg = (rating: number) => {
    if (rating >= 8) return 'bg-emerald-50';
    if (rating >= 6) return 'bg-amber-50';
    return 'bg-rose-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Website Rating & Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant insights about any website&apos;s design, SEO, and content quality
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 mb-8 transform transition-all hover:shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter a website URL (e.g., example.com)"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze Website'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-6 mb-8 rounded-r-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-rose-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {ratingData && (
          <div className="space-y-6">
            <div className="bg-white shadow-xl rounded-2xl p-8 transform transition-all hover:shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Analysis Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`${getRatingBg(ratingData.designRating)} rounded-xl p-6 transform transition-all hover:scale-105`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Design Rating</h3>
                  <p className={`text-4xl font-bold ${getRatingColor(ratingData.designRating)} mb-4`}>
                    {ratingData.designRating}/10
                  </p>
                  <p className="text-gray-600 text-sm">{ratingData.designFeedback}</p>
                </div>

                <div className={`${getRatingBg(ratingData.seoRating)} rounded-xl p-6 transform transition-all hover:scale-105`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">SEO Rating</h3>
                  <p className={`text-4xl font-bold ${getRatingColor(ratingData.seoRating)} mb-4`}>
                    {ratingData.seoRating}/10
                  </p>
                  <p className="text-gray-600 text-sm">{ratingData.seoFeedback}</p>
                </div>

                <div className={`${getRatingBg(ratingData.contentRating)} rounded-xl p-6 transform transition-all hover:scale-105`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Quality</h3>
                  <p className={`text-4xl font-bold ${getRatingColor(ratingData.contentRating)} mb-4`}>
                    {ratingData.contentRating}/10
                  </p>
                  <p className="text-gray-600 text-sm">{ratingData.contentFeedback}</p>
                </div>

                <div className={`${getRatingBg(ratingData.overallRating)} rounded-xl p-6 transform transition-all hover:scale-105`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Rating</h3>
                  <p className={`text-4xl font-bold ${getRatingColor(ratingData.overallRating)} mb-4`}>
                    {ratingData.overallRating.toFixed(1)}/10
                  </p>
                  <p className="text-gray-600 text-sm">{ratingData.overallFeedback}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Website Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Title</p>
                    <p className="text-lg font-semibold text-gray-900">{ratingData.title}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <p className="text-lg font-semibold text-gray-900">{ratingData.status}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Images</p>
                    <p className="text-lg font-semibold text-gray-900">{ratingData.images}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Buttons</p>
                    <p className="text-lg font-semibold text-gray-900">{ratingData.buttons}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteRatingPage;
