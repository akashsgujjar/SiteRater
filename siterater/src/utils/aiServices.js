// utils/aiServices.js
import { OpenAI } from 'openai';
import { load } from 'cheerio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI-based design rating
export async function getSiteRatingFromAI(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    // Analyze design elements
    const hasResponsiveMeta = $('meta[name="viewport"]').length > 0;
    const hasFavicon = $('link[rel="icon"]').length > 0;
    const hasCustomFonts = $('link[rel="stylesheet"][href*="font"]').length > 0;
    const hasCSS = $('link[rel="stylesheet"]').length > 0;
    const hasModernCSS = $('link[rel="stylesheet"][href*="tailwind"]').length > 0 || 
                        $('link[rel="stylesheet"][href*="bootstrap"]').length > 0;
    
    const designIssues = [];
    if (!hasResponsiveMeta) designIssues.push("Missing responsive viewport meta tag");
    if (!hasFavicon) designIssues.push("No favicon detected");
    if (!hasCustomFonts) designIssues.push("No custom fonts detected");
    if (!hasCSS) designIssues.push("No CSS stylesheets found");
    if (!hasModernCSS) designIssues.push("No modern CSS framework detected");

    const rating = Math.max(1, 10 - designIssues.length * 2);
    const feedback = designIssues.length > 0 
      ? `Design analysis found ${designIssues.length} issues: ${designIssues.join(', ')}.`
      : "Good design implementation with responsive meta tag, favicon, and proper styling.";

    return { rating, feedback };
  } catch (error) {
    console.error('Design rating error:', error);
    return { rating: 5, feedback: "Unable to analyze design at this time." };
  }
}

// AI-based SEO analysis
export async function analyzeSEO(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    // Analyze SEO elements
    const hasTitle = $('title').length > 0;
    const hasMetaDescription = $('meta[name="description"]').length > 0;
    const hasH1 = $('h1').length > 0;
    const hasH2 = $('h2').length > 0;
    const hasAltTags = $('img[alt]').length > 0;
    const hasCanonical = $('link[rel="canonical"]').length > 0;
    const hasOpenGraph = $('meta[property^="og:"]').length > 0;
    const hasTwitterCards = $('meta[name^="twitter:"]').length > 0;

    const seoIssues = [];
    if (!hasTitle) seoIssues.push("Missing title tag");
    if (!hasMetaDescription) seoIssues.push("Missing meta description");
    if (!hasH1) seoIssues.push("No H1 heading found");
    if (!hasH2) seoIssues.push("No H2 headings found");
    if (!hasAltTags) seoIssues.push("Images missing alt tags");
    if (!hasCanonical) seoIssues.push("No canonical URL specified");
    if (!hasOpenGraph) seoIssues.push("Missing Open Graph meta tags");
    if (!hasTwitterCards) seoIssues.push("Missing Twitter Card meta tags");

    const rating = Math.max(1, 10 - seoIssues.length);
    const feedback = seoIssues.length > 0 
      ? `SEO analysis found ${seoIssues.length} issues: ${seoIssues.join(', ')}.`
      : "Excellent SEO implementation with all key meta tags and proper structure.";

    return { rating, feedback };
  } catch (error) {
    console.error('SEO rating error:', error);
    return { rating: 5, feedback: "Unable to analyze SEO at this time." };
  }
}

// AI-based content quality analysis
export async function analyzeContent(content) {
  try {
    const $ = load(content);
    
    // Analyze content elements
    const textContent = $('body').text().trim();
    const wordCount = textContent.split(/\s+/).length;
    const hasImages = $('img').length > 0;
    const hasLinks = $('a').length > 0;
    const hasLists = $('ul, ol').length > 0;
    const hasTables = $('table').length > 0;
    const hasForms = $('form').length > 0;
    const hasVideos = $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0;

    const contentIssues = [];
    if (wordCount < 300) contentIssues.push("Content is too short (less than 300 words)");
    if (!hasImages) contentIssues.push("No images found in content");
    if (!hasLinks) contentIssues.push("No links found in content");
    if (!hasLists) contentIssues.push("No lists found in content");
    if (!hasTables && wordCount > 1000) contentIssues.push("Long content without tables for data organization");
    if (!hasForms && $('input, select, textarea').length === 0) contentIssues.push("No interactive elements found");
    if (!hasVideos && wordCount > 2000) contentIssues.push("Long content without video elements");

    const rating = Math.max(1, 10 - contentIssues.length);
    const feedback = contentIssues.length > 0 
      ? `Content analysis found ${contentIssues.length} issues: ${contentIssues.join(', ')}.`
      : "Rich content with good mix of text, media, and interactive elements.";

    return { rating, feedback };
  } catch (error) {
    console.error('Content rating error:', error);
    return { rating: 5, feedback: "Unable to analyze content at this time." };
  }
}

// Helper functions to generate feedback based on ratings
function getDesignFeedback(rating) {
  if (rating >= 9) return "Excellent design with modern aesthetics, great visual hierarchy, and responsive layout.";
  if (rating >= 7) return "Good design with clean layout and decent visual appeal. Some minor improvements possible.";
  if (rating >= 5) return "Average design. Consider improving visual hierarchy and user experience.";
  return "Design needs significant improvement. Focus on layout, responsiveness, and visual appeal.";
}

function getSEOFeedback(rating) {
  if (rating >= 9) return "Outstanding SEO implementation with proper meta tags, structure, and optimization.";
  if (rating >= 7) return "Good SEO practices in place. Some opportunities for improvement in meta tags and structure.";
  if (rating >= 5) return "Basic SEO elements present. Consider enhancing meta descriptions and content structure.";
  return "SEO needs attention. Focus on implementing basic SEO elements and improving content structure.";
}

function getContentFeedback(rating) {
  if (rating >= 9) return "Exceptional content quality with clear messaging, good grammar, and engaging material.";
  if (rating >= 7) return "Good content with clear communication and decent engagement. Minor improvements possible.";
  if (rating >= 5) return "Average content quality. Consider improving clarity and engagement.";
  return "Content needs improvement. Focus on clarity, grammar, and user engagement.";
}
