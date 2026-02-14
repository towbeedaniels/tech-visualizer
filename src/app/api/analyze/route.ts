import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { targetUrl } = await req.json();
    const API_KEY = process.env.WAPPALYZER_API_KEY;

    if (!targetUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Wappalyzer V2 Lookup Endpoint
    const response = await fetch(`https://api.wappalyzer.com/v2/lookup/?urls=${encodeURIComponent(targetUrl)}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || 'API Error' }, { status: response.status });
    }

    const data = await response.json();
    // Wappalyzer returns an array of results for each URL requested
    return NextResponse.json(data[0] || { technologies: [] });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}