/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import * as cheerio from 'cheerio';

export async function analyzeStack(url: string) {
  try {
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      next: { revalidate: 3600 } 
    });
    
    const html = await response.text();
    const headers = response.headers;
    const $ = cheerio.load(html);
    const stack = new Set<{name: string, cat: string}>();

    // 1. HEADER CHECKS
    const server = headers.get('server') || '';
    if (server.includes('Cloudflare')) stack.add({ name: 'Cloudflare', cat: 'CDN/Security' });
    if (server.includes('Vercel')) stack.add({ name: 'Vercel', cat: 'Hosting' });
    if (headers.get('x-powered-by')?.includes('Next.js')) stack.add({ name: 'Next.js', cat: 'Framework' });

    // 2. CSS FRAMEWORK DETECTION (The "Fingerprints")
    const htmlString = $.html();
    
    // Tailwind: Searches for common utility patterns or the tailwind cdn
    if (htmlString.includes('tailwindcss') || /class="[^"]*([mp][xy]-[0-9]|flex|grid|bg-)/.test(htmlString)) {
      stack.add({ name: 'Tailwind CSS', cat: 'CSS Framework' });
    }
    
    // Bootstrap: Looks for versioned links or standard class names
    if (htmlString.includes('bootstrap.min.css') || htmlString.includes('btn-primary')) {
      stack.add({ name: 'Bootstrap', cat: 'CSS Framework' });
    }

    // 3. JAVASCRIPT LIBRARIES
    const scripts = $('script').map((i, el) => $(el).attr('src') || '').get().join(' ');
    if (scripts.includes('react')) stack.add({ name: 'React', cat: 'Frontend Library' });
    if (scripts.includes('jquery')) stack.add({ name: 'jQuery', cat: 'JavaScript Library' });
    if (scripts.includes('gtm.js') || htmlString.includes('googletagmanager')) {
      stack.add({ name: 'Google Tag Manager', cat: 'Analytics' });
    }

    // 4. CMS DETECTION
    if (htmlString.includes('wp-content') || htmlString.includes('wordpress')) {
      stack.add({ name: 'WordPress', cat: 'CMS' });
    }
    if (htmlString.includes('shopify')) stack.add({ name: 'Shopify', cat: 'E-commerce' });

    return { 
      success: true, 
      technologies: Array.from(stack) 
    };
  } catch (error) {
    return { success: false, error: "URL unreachable. Ensure it starts with https://" };
  }
}