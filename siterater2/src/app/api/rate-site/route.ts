import { NextResponse } from 'next/server';
import { analyzeWebsite } from '@/utils/gptAnalysis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, mode = 'professional' } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    const analysis = await analyzeWebsite(url, mode);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing website:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    );
  }
} 