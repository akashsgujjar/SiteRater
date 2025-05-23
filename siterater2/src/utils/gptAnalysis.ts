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

export async function analyzeWebsite(url: string, mode: 'professional' | 'roast' = 'professional'): Promise<WebsiteAnalysis> {
  try {
    // Fetch the website content
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract relevant information
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const headings = $('h1, h2, h3').map((_, el) => $(el).text()).get();
    const images = $('img').length;
    const links = $('a').length;

    const prompt = mode === 'professional' 
      ? `Analyze this website professionally and provide constructive feedback:
         URL: ${url}
         Title: ${title}
         Meta Description: ${metaDescription}
         Number of Headings: ${headings.length}
         Number of Images: ${images}
         Number of Links: ${links}
         
         Please provide:
         1. An overall score out of 100
         2. Individual scores for design, content, performance, accessibility, and SEO
         3. Detailed feedback focusing on strengths and areas for improvement
         4. Specific, actionable recommendations
         
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
         }`
      : `Roast this website in a funny but brutally honest way:
         URL: ${url}
         Title: ${title}
         Meta Description: ${metaDescription}
         Number of Headings: ${headings.length}
         Number of Images: ${images}
         Number of Links: ${links}
         
         Please provide:
         1. An overall score out of 100 (be harsh but fair)
         2. Individual scores for design, content, performance, accessibility, and SEO
         3. A hilarious roast of the website's flaws and design choices
         4. Funny but actually helpful suggestions for improvement
         
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: mode === 'professional' 
            ? "You are a professional website analyst providing constructive feedback."
            : "You are a witty website critic who roasts websites in a funny but informative way."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from GPT');
    }

    return JSON.parse(content) as WebsiteAnalysis;
  } catch (error) {
    console.error('Error in analyzeWebsite:', error);
    throw error;
  }
} 