"use server";

import * as cheerio from 'cheerio';

export async function performInstantScan(url: string) {
  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(targetUrl, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) throw new Error(`Site responded with status: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const htmlLower = html.toLowerCase();
    
    // Safety Check: Is it HTTPS?
    const isSecure = targetUrl.startsWith('https');

    // Metadata
    const metadata = {
      title: $('title').text() || 'No Title Found',
      description: $('meta[name="description"]').attr('content') || 'No description available.',
    };

    const techList: any[] = [];

    // Detection Helper
    const check = (pattern: string, name: string, cat: string, slug: string) => {
      if (htmlLower.includes(pattern.toLowerCase())) {
        if (!techList.find(t => t.name === name)) {
          techList.push({ name, cat, logo: `https://cdn.simpleicons.org/${slug}` });
        }
      }
    };

    // --- Expanded Rules ---
    check('_next/static', 'Next.js', 'Framework', 'nextdotjs');
    check('react-dom', 'React', 'Library', 'react');
    check('tailwindcss', 'Tailwind CSS', 'UI Framework', 'tailwindcss');
    check('wp-content', 'WordPress', 'CMS', 'wordpress');
    check('shopify', 'Shopify', 'E-commerce', 'shopify');
    check('googletagmanager', 'GTM', 'Analytics', 'googleanalytics');
    check('cloudflare', 'Security', 'Cloudflare', 'cloudflare');
    check('vercel', 'Hosting', 'Vercel', 'vercel');
    check('bootstrap', 'Bootstrap', 'UI Framework', 'bootstrap');
    check('jquery', 'jQuery', 'Library', 'jquery');
    check('contentful', 'Contentful', 'CMS', 'contentful');

    return { 
      success: true, 
      url: targetUrl, 
      isSecure,
      metadata,
      tech: techList
    };
  } catch (error: any) {
    console.error("Scan Error:", error);
    return { success: false, error: "Scan failed. The site might be blocking automated requests." };
  }
}