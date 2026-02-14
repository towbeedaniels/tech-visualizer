/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import * as cheerio from 'cheerio';

export async function performInstantScan(url: string) {
  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(targetUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) throw new Error(`Site responded with status: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const htmlLower = html.toLowerCase();
    
    // Page Metadata
    const metadata = {
      title: $('title').text() || 'No Title Found',
      description: $('meta[name="description"]').attr('content') || 'No description available for this site.',
    };

    const foundTech = new Map();

    // Helper to add tech with logos
    const addTech = (name: string, cat: string, slug: string) => {
      foundTech.set(name, { 
        name, 
        cat, 
        logo: `https://cdn.simpleicons.org/${slug}` 
      });
    };

    // Detection rules
    if (htmlLower.includes('_next/static')) addTech('Next.js', 'Framework', 'nextdotjs');
    if (htmlLower.includes('react-dom')) addTech('React', 'Library', 'react');
    if (htmlLower.includes('tailwindcss')) addTech('Tailwind CSS', 'UI Framework', 'tailwindcss');
    if (htmlLower.includes('wordpress')) addTech('WordPress', 'CMS', 'wordpress');
    if (htmlLower.includes('shopify')) addTech('Shopify', 'E-commerce', 'shopify');
    if (htmlLower.includes('googletagmanager')) addTech('GTM', 'Analytics', 'googleanalytics');
    if (htmlLower.includes('cloudflare')) addTech('Cloudflare', 'Security', 'cloudflare');
    if (htmlLower.includes('vercel')) addTech('Vercel', 'Hosting', 'vercel');

    return { 
      success: true, 
      metadata,
      tech: Array.from(foundTech.values())
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}