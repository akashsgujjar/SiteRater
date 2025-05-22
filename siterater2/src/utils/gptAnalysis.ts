import OpenAI from 'openai';
import * as cheerio from 'cheerio';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function analyzeWebsite(url: string, html: string): Promise<WebsiteAnalysis> {
  // Parse HTML using cheerio
  const $ = cheerio.load(html);
  
  // Extract relevant information
  const title = $('title').text();
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const headings = $('h1, h2, h3').map((_, el) => $(el).text()).get();
  const links = $('a').map((_, el) => $(el).attr('href')).get();
  const images = $('img').map((_, el) => ({
    src: $(el).attr('src'),
    alt: $(el).attr('alt')
  })).get();

  // Prepare the prompt for GPT
  const prompt = `Analyze this website and provide a detailed rating:
URL: ${url}
Title: ${title}
Meta Description: ${metaDescription}
Headings: ${headings.join(', ')}
Number of Links: ${links.length}
Number of Images: ${images.length}

Please provide:
1. An overall score out of 100
2. Individual scores for:
   - Design (out of 100)
   - Content (out of 100)
   - Performance (out of 100)
   - Accessibility (out of 100)
   - SEO (out of 100)
3. Detailed feedback
4. Specific recommendations for improvement

Format the response as a JSON object with the following structure:
{
  "overallScore": number,
  "categories": {
    "design": number,
    "content": number,
    "performance": number,
    "accessibility": number,
    "seo": number
  },
  "feedback": string,
  "recommendations": string[]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a professional website analyst. Provide detailed, constructive feedback and specific recommendations for improvement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content) as WebsiteAnalysis;
    return analysis;
  } catch (error) {
    console.error('Error analyzing website:', error);
    throw new Error('Failed to analyze website');
  }
} 