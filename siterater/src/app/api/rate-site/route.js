import { load } from 'cheerio';
import { getSiteRatingFromAI, analyzeSEO, analyzeContent } from '@/utils/aiServices.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return Response.json({ error: 'Missing url param' }, { status: 400 });
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    // Fetch the webpage with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const fetchRes = await fetch(targetUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"'
      },
      signal: controller.signal,
      redirect: 'follow',
      referrerPolicy: 'no-referrer-when-downgrade'
    });

    clearTimeout(timeoutId);

    if (!fetchRes.ok) {
      if (fetchRes.status === 403) {
        return Response.json({
          error: 'Access denied by website',
          details: 'The website has blocked automated access. Try a different website.',
          status: 403
        }, { status: 403 });
      }
      throw new Error(`HTTP error! status: ${fetchRes.status}`);
    }

    const status = fetchRes.status;
    const html = await fetchRes.text();
    
    if (!html) {
      throw new Error('No content received from the URL');
    }

    const $ = load(html);

    // Basic data collection with error handling
    const title = $('title').text()?.trim() || 'No title found';
    const images = $('img').length;
    const buttons = $('button').length;
    const bodyText = $('body').text()?.trim() || '';

    // AI and SEO analysis with error handling
    let designRating, seoRating, contentRating;
    let designFeedback, seoFeedback, contentFeedback;
    
    try {
      const designAnalysis = await getSiteRatingFromAI(targetUrl);
      designRating = designAnalysis.rating;
      designFeedback = designAnalysis.feedback;
    } catch (err) {
      console.error('Design rating error:', err);
      designRating = 5;
      designFeedback = "Unable to analyze design at this time.";
    }

    try {
      const seoAnalysis = await analyzeSEO(targetUrl);
      seoRating = seoAnalysis.rating;
      seoFeedback = seoAnalysis.feedback;
    } catch (err) {
      console.error('SEO rating error:', err);
      seoRating = 5;
      seoFeedback = "Unable to analyze SEO at this time.";
    }

    try {
      const contentAnalysis = await analyzeContent(bodyText);
      contentRating = contentAnalysis.rating;
      contentFeedback = contentAnalysis.feedback;
    } catch (err) {
      console.error('Content rating error:', err);
      contentRating = 5;
      contentFeedback = "Unable to analyze content at this time.";
    }

    const overallRating = (designRating + seoRating + contentRating) / 3;
    const overallFeedback = `Based on our analysis, this website has ${overallRating >= 8 ? 'excellent' : overallRating >= 6 ? 'good' : 'room for improvement'} overall quality.`;

    return Response.json({
      status,
      title,
      images,
      buttons,
      designRating,
      designFeedback,
      seoRating,
      seoFeedback,
      contentRating,
      contentFeedback,
      overallRating,
      overallFeedback
    });
  } catch (err) {
    console.error('Error processing URL:', err);
    return Response.json(
      { 
        error: 'Failed to fetch or parse URL', 
        details: err.message,
        url: targetUrl
      },
      { status: 500 }
    );
  }
}
