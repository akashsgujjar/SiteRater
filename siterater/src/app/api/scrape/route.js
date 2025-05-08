// app/api/scrape/route.js

import { load } from 'cheerio';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return Response.json({ error: 'Missing url param' }, { status: 400 });
  }

  try {
    const fetchRes = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const status = fetchRes.status;
    const html = await fetchRes.text();
    const $ = load(html);

    const title = $('title').text() || null;
    const hasForms = $('form').length > 0;

    const links = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href?.startsWith('http')) links.push(href);
    });

    const checkedLinks = await Promise.all(
      links.slice(0, 5).map(async (link) => {
        try {
          const res = await fetch(link);
          return { url: link, status: res.status };
        } catch {
          return { url: link, status: 'failed' };
        }
      })
    );

    return Response.json({ status, title, hasForms, totalLinks: links.length, checkedLinks });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch or parse URL', details: err.message }, { status: 500 });
  }
}
