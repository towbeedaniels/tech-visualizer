/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import * as cheerio from 'cheerio';

export async function performInstantScan(url: string) {
  try {
    // 1. Validate URL format
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;

    // 2. Fetch with a real Browser User-Agent to avoid being blocked
    const response = await fetch(targetUrl, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) throw new Error(`Site responded with status: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const foundTech = new Set<{name: string, cat: string}>();

    // --- EXPANDED DETECTION ENGINE ---
    const htmlLower = html.toLowerCase();
    const scripts = $('script').map((i, el) => $(el).attr('src') || '').get().join(' ').toLowerCase();
    const links = $('link').map((i, el) => $(el).attr('href') || '').get().join(' ').toLowerCase();

    // Frameworks & Libraries
    if (htmlLower.includes('_next/static') || htmlLower.includes('next.js')) foundTech.add({ name: 'Next.js', cat: 'Framework' });
    if (htmlLower.includes('react-dom') || scripts.includes('react')) foundTech.add({ name: 'React', cat: 'Library' });
    if (htmlLower.includes('vue.js') || scripts.includes('vue')) foundTech.add({ name: 'Vue.js', cat: 'Framework' });
    if (scripts.includes('jquery')) foundTech.add({ name: 'jQuery', cat: 'Library' });

    // CSS Frameworks
    if (htmlLower.includes('tailwindcss') || htmlLower.includes('tailwind.min.css')) foundTech.add({ name: 'Tailwind CSS', cat: 'UI' });
    if (links.includes('bootstrap') || htmlLower.includes('btn-primary')) foundTech.add({ name: 'Bootstrap', cat: 'UI' });

    // CMS & E-commerce
    if (htmlLower.includes('wp-content') || htmlLower.includes('wordpress')) foundTech.add({ name: 'WordPress', cat: 'CMS' });
    if (htmlLower.includes('shopify') || scripts.includes('shopify')) foundTech.add({ name: 'Shopify', cat: 'E-commerce' });
    if (htmlLower.includes('wix.com')) foundTech.add({ name: 'Wix', cat: 'CMS' });

    // Analytics & Tools
    if (htmlLower.includes('googletagmanager') || htmlLower.includes('gtm.js')) foundTech.add({ name: 'Google Tag Manager', cat: 'Analytics' });
    if (htmlLower.includes('google-analytics') || htmlLower.includes('ga.js')) foundTech.add({ name: 'Google Analytics', cat: 'Analytics' });
    if (htmlLower.includes('cloudflare')) foundTech.add({ name: 'Cloudflare', cat: 'CDN/Security' });

    return { 
      success: true, 
      url: targetUrl, 
      tech: Array.from(foundTech)
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Could not scan this site." };
  }
}