import { getSiteRatingFromAI, analyzeSEO, analyzeContent } from '../../utils/aiServices';

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
    const fetchRes = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const status = fetchRes.status;
    const html = await fetchRes.text();
    const $ = load(html);

    // Basic data collection
    const title = $('title').text() || null;
    const images = $('img').length;
    const buttons = $('button').length;

    // AI and SEO analysis
    const designRating = await getSiteRatingFromAI(targetUrl);
    const seoRating = await analyzeSEO(targetUrl);
    const contentRating = await analyzeContent($('body').text());

    return Response.json({
      status,
      title,
      images,
      buttons,
      designRating,
      seoRating,
      contentRating,
      overallRating: (designRating + seoRating + contentRating) / 3
    });
  } catch (err) {
    return Response.json(
      { error: 'Failed to fetch or parse URL', details: err.message },
      { status: 500 }
    );
  }
}
