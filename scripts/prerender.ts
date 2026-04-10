import express, { Request, Response, RequestHandler } from 'express';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');

if (!fs.existsSync(distPath)) {
  console.error('dist directory does not exist. Please build the project first.');
  process.exit(1);
}

const app = express();
// Serve static files from dist
app.use(express.static(distPath));

// For all other routes, serve index.html
const catchAll: RequestHandler = (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
};
app.use(catchAll);

const PORT = 54321;

// All public routes that should be prerendered for SEO
const ROUTES_TO_PRERENDER = [
  '/',
  '/fr',
  '/en',
  // Discover
  '/fr/discover',
  '/en/discover',
  // News
  '/fr/news',
  '/en/news',
  // Schedule
  '/fr/schedule',
  '/en/schedule',
  // Changelog
  '/fr/changelog',
  '/en/changelog',
  // Challenges
  '/fr/challenges',
  '/en/challenges',
  // Social
  '/fr/social',
  '/en/social',
  // Tier Lists
  '/fr/tierlist',
  '/en/tierlist',
  // Donors
  '/fr/donors',
  '/en/donors',
  // Lens
  '/fr/lens',
  '/en/lens',
  // Feedback
  '/fr/feedback',
  '/en/feedback',
  // Legal / Static pages
  '/fr/about',
  '/en/about',
  '/fr/privacy',
  '/en/privacy',
  '/fr/terms',
  '/en/terms',
  '/fr/contact',
  '/en/contact',
  '/fr/credits',
  '/en/credits',
  '/fr/legal',
  '/en/legal',
  // Auth
  '/fr/auth',
  '/en/auth',
  // Library
  '/fr/library',
  '/en/library',
  // Form Survey
  '/fr/form',
  '/en/form',
];

app.listen(PORT, async () => {
  console.log(`Temp server listening on port ${PORT} for prerendering...`);
  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set a modern viewport
    await page.setViewport({ width: 1280, height: 800 });

    // Set Googlebot user-agent so isBot() returns true
    // This skips the LoadingScreen and allows content to render immediately
    await page.setUserAgent(
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    );
    
    const routesToVisit = [...ROUTES_TO_PRERENDER];
    const visited = new Set<string>();

    for (const route of routesToVisit) {
      if (visited.has(route)) continue;
      visited.add(route);

      console.log(`Prerendering ${route}...`);
      
      try {
        // Use networkidle2 (allows 2 ongoing connections) because Firebase
        // keeps persistent WebSocket connections open (auth, Firestore realtime,
        // analytics) that never close — networkidle0 will always timeout.
        // If networkidle2 also times out, fallback to domcontentloaded + manual wait.
        try {
          await page.goto(`http://localhost:${PORT}${route}`, { 
            waitUntil: 'networkidle2', 
            timeout: 30000 
          });
        } catch {
          console.warn(`  ⚠ networkidle2 timed out for ${route}, retrying with domcontentloaded...`);
          await page.goto(`http://localhost:${PORT}${route}`, { 
            waitUntil: 'domcontentloaded', 
            timeout: 15000 
          });
          // Give extra time for JS to execute and React to render
          await new Promise(r => setTimeout(r, 5000));
        }
        
        // Wait for actual content to appear in #root
        await page.waitForSelector('#root > *', { timeout: 10000 }).catch(() => {
          console.warn(`  ⚠ No content appeared in #root for ${route} within timeout`);
        });

        // Give React extra time to finish rendering (lazy loads, suspense, etc.)
        await new Promise(r => setTimeout(r, 2000));

        // Detect language from route
        const langCode = route.startsWith('/en') ? 'en' : 'fr';
        
        // Inject prerender markers and clean up
        await page.evaluate((lang) => {
          // Mark as prerendered for hydration detection in main.tsx
          document.body.classList.add('is-prerendered');
          document.documentElement.setAttribute('data-lang', lang);
          
          // Remove any loading screens or spinners that might remain
          const loadingScreens = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
          loadingScreens.forEach(el => el.remove());
          
          // Remove service worker registration scripts to prevent SW from
          // interfering with bot crawling
          const swScripts = document.querySelectorAll('script[src*="sw.js"], link[href*="manifest.webmanifest"]');
          swScripts.forEach(el => el.remove());
        }, langCode);

        const html = await page.content();
        
        // Verify we actually have content (not just an empty shell)
        const hasContent = html.includes('id="root"') && 
                          (html.length > 5000) && 
                          !html.includes('CHARGEMENT'); // The loading screen text
        
        if (!hasContent) {
          console.warn(`  ⚠ Page ${route} appears to have no real content (${html.length} bytes). Skipping save.`);
          continue;
        }

        // Save the HTML to dist
        // e.g. /fr/news -> dist/fr/news/index.html
        let outPath = route;
        if (outPath === '/') outPath = '/index.html';
        else if (!outPath.endsWith('.html')) outPath = `${route}/index.html`;
        
        const fullPath = path.join(distPath, outPath);
        
        // Create directories if they don't exist
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, html);
        console.log(`  ✅ Saved ${fullPath} (${html.length} bytes)`);
    
        // If we are on a news list page, try to discover individual article links
        if (route.endsWith('/news')) {
           const links = await page.evaluate(() => {
               const anchors = Array.from(document.querySelectorAll('a'));
               return anchors
                .map((a: HTMLAnchorElement) => a.getAttribute('href'))
                .filter((href: string | null) => href && (href.includes('/news/article') || href.includes('/n/')));
           });
           
           let addedCount = 0;
           for (const link of links) {
               if (addedCount >= 5) break; // Limit to 5 articles
               if (link && !visited.has(link) && !routesToVisit.includes(link) && link.startsWith('/')) {
                   console.log(`  📰 Discovered news article: ${link}`);
                   routesToVisit.push(link);
                   addedCount++;
               }
           }
        }
      } catch (err) {
        console.warn(`  ❌ Failed to prerender ${route}:`, err);
      }
    }

    await browser.close();
    console.log(`\nPrerendering completed. ${visited.size} routes processed.`);
    process.exit(0);
  } catch (error) {
    console.error('Prerendering failed with fatal error:', error);
    process.exit(1);
  }
});
