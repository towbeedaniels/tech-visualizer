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

    // 1. Response Headers
    const server = response.headers.get('server')?.toLowerCase() || '';
    const poweredBy = response.headers.get('x-powered-by')?.toLowerCase() || '';
    
    if (server.includes('vercel')) add('Vercel', 'Hosting', 'vercel');
    if (server.includes('netlify')) add('Netlify', 'Hosting', 'netlify');
    if (server.includes('nginx')) add('Nginx', 'Server', 'nginx');
    if (server.includes('apache')) add('Apache', 'Server', 'apache');
    if (server.includes('cloudflare')) add('Cloudflare', 'Security', 'cloudflare');
    if (poweredBy.includes('express')) add('Express', 'Framework', 'express');
    if (poweredBy.includes('django')) add('Django', 'Framework', 'django');
    if (poweredBy.includes('rails')) add('Ruby on Rails', 'Framework', 'rubyonrails');

    // 2. Structural IDs (Hard to hide)
    if ($('#__next').length > 0) add('Next.js', 'Framework', 'nextdotjs');
    if ($('#__nuxt').length > 0) add('Nuxt.js', 'Framework', 'nuxtdotjs');
    if ($('#app').length > 0 || $('#root').length > 0) add('React', 'Library', 'react');
    if ($('[data-v-app]').length > 0) add('Vue.js', 'Library', 'vuedotjs');
    if ($('[ng-app]').length > 0 || $('[ng-version]').length > 0) add('Angular', 'Framework', 'angular');
    
    // 3. Script & Link Tag analysis
    const scripts = $('script').map((i, el) => $(el).attr('src') || '').get().join(' ').toLowerCase();
    const links = $('link').map((i, el) => $(el).attr('href') || '').get().join(' ').toLowerCase();
    const inlineScripts = $('script').map((i, el) => $(el).html() || '').get().join(' ').toLowerCase();

    if (scripts.includes('static/chunks') || scripts.includes('/_next')) add('Next.js', 'Framework', 'nextdotjs');
    if (scripts.includes('_nuxt')) add('Nuxt.js', 'Framework', 'nuxtdotjs');
    if (scripts.includes('react') || scripts.includes('react-dom')) add('React', 'Library', 'react');
    if (scripts.includes('vue')) add('Vue.js', 'Library', 'vuedotjs');
    if (scripts.includes('angular')) add('Angular', 'Framework', 'angular');
    if (scripts.includes('wp-includes') || scripts.includes('wp-content')) add('WordPress', 'CMS', 'wordpress');
    if (scripts.includes('.shopify.com')) add('Shopify', 'E-commerce', 'shopify');
    if (scripts.includes('jquery')) add('jQuery', 'Library', 'jquery');
    if (scripts.includes('gsap')) add('GSAP', 'Animation', 'greensock');
    if (scripts.includes('stripe')) add('Stripe', 'Payment', 'stripe');
    if (scripts.includes('gtag') || scripts.includes('google-analytics')) add('Google Analytics', 'Analytics', 'googleanalytics');
    if (inlineScripts.includes('window.__data__') || inlineScripts.includes('window.__initial')) add('Gatsby', 'Framework', 'gatsby');
    
    // 4. CSS Framework Detection
    const allHtml = html.substring(0, 50000);
    
    if (/class="[^"]*(\s|^)(mt|mb|ml|mr|pt|pb|pl|pr|px|py|p)-[0-9]/.test(allHtml) || htmlLower.includes('tailwindcss')) {
      add('Tailwind CSS', 'UI Framework', 'tailwindcss');
    }
    if (/class="[^"]*(\s|^)btn(-[a-z]+)?(\s|")?/.test(allHtml) || scripts.includes('bootstrap') || links.includes('bootstrap')) {
      add('Bootstrap', 'UI Framework', 'bootstrap');
    }
    if (htmlLower.includes('material-ui') || htmlLower.includes('@material-ui') || htmlLower.includes('mui')) {
      add('Material-UI', 'UI Framework', 'materialui');
    }
    if (htmlLower.includes('chakra')) add('Chakra UI', 'UI Framework', 'chakraui');
    if (htmlLower.includes('ant-design') || htmlLower.includes('antd')) add('Ant Design', 'UI Framework', 'antdesign');
    
    // 5. Meta Tags & Generator
    const generator = $('meta[name="generator"]').attr('content')?.toLowerCase() || '';
    const techStack = $('meta[name="tech-stack"]').attr('content')?.toLowerCase() || '';
    
    if (generator.includes('wordpress')) add('WordPress', 'CMS', 'wordpress');
    if (generator.includes('next.js')) add('Next.js', 'Framework', 'nextdotjs');
    if (generator.includes('gatsby')) add('Gatsby', 'Framework', 'gatsby');
    if (generator.includes('hugo')) add('Hugo', 'Static Site Generator', 'hugo');
    if (techStack) add(techStack.charAt(0).toUpperCase() + techStack.slice(1), 'Tech', 'codeclimate');

    // 6. Font Services
    if (links.includes('fonts.googleapis.com')) add('Google Fonts', 'Font Service', 'googlefonts');
    if (links.includes('fonts.adobe.com') || htmlLower.includes('typekit')) add('Adobe Fonts', 'Font Service', 'adobeexperiencecloud');
    
    // 7. CDN & Hosting Services
    if (htmlLower.includes('cdn.jsdelivr.net')) add('jsDelivr', 'CDN', 'jsdelivr');
    if (htmlLower.includes('cdnjs.cloudflare.com')) add('Cloudflare CDN', 'CDN', 'cloudflare');
    if (htmlLower.includes('unpkg.com')) add('unpkg', 'CDN', 'npm');
    
    // 8. Analytics & Tracking
    if (htmlLower.includes('gtag') || htmlLower.includes('ga(')) add('Google Analytics', 'Analytics', 'googleanalytics');
    if (htmlLower.includes('mixpanel')) add('Mixpanel', 'Analytics', 'mixpanel');
    if (htmlLower.includes('segment')) add('Segment', 'Analytics', 'segment');
    if (htmlLower.includes('hotjar')) add('Hotjar', 'Analytics', 'hotjar');
    
    // 9. CMS & Site Builders
    if (generator.includes('drupal')) add('Drupal', 'CMS', 'drupal');
    if (generator.includes('joomla')) add('Joomla', 'CMS', 'joomla');
    if (htmlLower.includes('webflow')) add('Webflow', 'Site Builder', 'webflow');
    if (htmlLower.includes('wix')) add('Wix', 'Site Builder', 'wix');
    if (htmlLower.includes('squarespace')) add('Squarespace', 'Site Builder', 'squarespace');
    
    // 10. Payment Gateways
    if (htmlLower.includes('braintree')) add('Braintree', 'Payment', 'braintree');
    if (htmlLower.includes('paypal')) add('PayPal', 'Payment', 'paypal');
    
    // 11. Authentication Services
    if (htmlLower.includes('auth0')) add('Auth0', 'Authentication', 'auth0');
    if (htmlLower.includes('firebase') || htmlLower.includes('firebaseapp')) add('Firebase', 'Backend', 'firebase');

    return { 
      success: true, 
      url: targetUrl, 
      isSecure,
      metadata,
      tech: Array.from(techMap.values())
    };
  } catch {
    return { success: false, error: "Website blocked the scan or is unreachable." };
  }
}