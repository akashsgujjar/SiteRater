import { NextResponse } from 'next/server';
import { analyzeWebsite } from '@/utils/gptAnalysis';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Fetch the website content
    const response = await fetch(url);
    const html = await response.text();

    // Analyze the website
    const analysis = await analyzeWebsite(url, html);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in rate-site API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    );
  }
} 