"use server";

import * as cheerio from 'cheerio';

export async function performInstantScan(url: string) {
  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(targetUrl, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) throw new Error(`Site responded with status: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const htmlLower = html.toLowerCase();
    
    // Safety & Metadata
    const isSecure = targetUrl.startsWith('https');
    const metadata = {
      title: $('title').text().trim() || 'No Title Found',
      description: $('meta[name="description"]').attr('content') || 'No description available.',
    };

    const techMap = new Map();
    const add = (name: string, cat: string, slug: string) => {
      techMap.set(name, { name, cat, logo: `https://cdn.simpleicons.org/${slug}` });
    };

    // --- DEEP FINGERPRINTING ---

    // 1. Structural IDs (Hard to hide)
    if ($('#__next').length > 0) add('Next.js', 'Framework', 'nextdotjs');
    if ($('#root').length > 0 || $('#app').length > 0) add('React', 'Library', 'react');
    
    // 2. Script & Link Tag analysis
    const scripts = $('script').map((i, el) => $(el).attr('src') || '').get().join(' ');
    const links = $('link').map((i, el) => $(el).attr('href') || '').get().join(' ');

    if (scripts.includes('static/chunks')) add('Next.js', 'Framework', 'nextdotjs');
    if (scripts.includes('wp-includes')) add('WordPress', 'CMS', 'wordpress');
    if (scripts.includes('shopify')) add('Shopify', 'E-commerce', 'shopify');
    
    // 3. CSS Class Patterns (Tailwind/Bootstrap)
    const bodyClasses = $('body').attr('class') || '';
    if (/([mp][xy]-[0-9]|flex|grid|bg-)/.test(bodyClasses) || htmlLower.includes('tailwindcss')) {
      add('Tailwind CSS', 'UI Framework', 'tailwindcss');
    }
    if (htmlLower.includes('btn-primary') || links.includes('bootstrap')) {
      add('Bootstrap', 'UI Framework', 'bootstrap');
    }

    // 4. Meta Generator tags
    const generator = $('meta[name="generator"]').attr('content')?.toLowerCase() || '';
    if (generator.includes('wordpress')) add('WordPress', 'CMS', 'wordpress');
    if (generator.includes('next.js')) add('Next.js', 'Framework', 'nextdotjs');

    // 5. General Keywords
    if (htmlLower.includes('cloudflare')) add('Cloudflare', 'Security', 'cloudflare');
    if (htmlLower.includes('googletagmanager')) add('GTM', 'Analytics', 'googleanalytics');

    return { 
      success: true, 
      url: targetUrl, 
      isSecure,
      metadata,
      tech: Array.from(techMap.values())
    };
  } catch (error: any) {
    return { success: false, error: "Website blocked the scan or is unreachable." };
  }
}