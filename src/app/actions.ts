/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import * as cheerio from 'cheerio';

export async function performInstantScan(url: string) {
  try {
    // Add a small delay to simulate a "deep scan" feel if desired, 
    // or keep it raw for max speed.
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store' 
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const foundTech = [];

    // Fingerprinting
    const htmlLower = html.toLowerCase();
    if (htmlLower.includes('next-share')) foundTech.push({ name: 'Next.js', cat: 'Framework' });
    if (htmlLower.includes('wp-content')) foundTech.push({ name: 'WordPress', cat: 'CMS' });
    if (htmlLower.includes('tailwindcss')) foundTech.push({ name: 'Tailwind CSS', cat: 'UI' });
    if (htmlLower.includes('googletagmanager')) foundTech.push({ name: 'GTM', cat: 'Analytics' });
    if (htmlLower.includes('react-dom')) foundTech.push({ name: 'React', cat: 'Library' });

    return { 
      success: true, 
      url, 
      tech: foundTech, 
      rawHeaders: Array.from(response.headers.entries()) 
    };
  } catch (error) {
    return { success: false, error: "Website unreachable. Make sure to include https://" };
  }
}