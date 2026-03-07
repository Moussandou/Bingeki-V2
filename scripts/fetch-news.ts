import Parser from 'rss-parser';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import sanitizeHtml from 'sanitize-html';
import * as dotenv from 'dotenv';

dotenv.config();

// We need a service account key to write to Firestore from a Node script.
// In GitHub Actions, this will be passed via environment variables.
const serviceAccountKeyStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_BINGEKI;

if (!serviceAccountKeyStr) {
    console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_BINGEKI in environment variables.");
    process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountKeyStr);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const parser = new Parser({
    customFields: {
        item: ['media:content', 'media:thumbnail', 'content:encoded', 'category'],
    }
});

const FEEDS = [
    {
        name: "Anime News Network",
        url: "https://www.animenewsnetwork.com/news/rss.xml",
        selector: ".meat, #maincontent .meat, #maincontent",
        limit: 15
    },
    {
        name: "Crunchyroll News",
        url: "https://cr-news-api-service.prd.crunchyrollsvc.com/v1/en-US/rss",
        limit: 15
    },
    {
        name: "MyAnimeList News",
        url: "https://myanimelist.net/rss/news.xml",
        limit: 15
    }
];

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

async function processItem(item: any, feedConfig: any, forceUpdate: boolean) {
    if (!item.title || !item.link) return;

    const slug = generateSlug(item.title);
    const docRef = db.collection('news').doc(slug);
    const docSnap = await docRef.get();

    if (docSnap.exists && !forceUpdate) {
        console.log(` - Skipped: ${item.title}`);
        return;
    }

    let imageUrl = null;
    let fullContent = item['content:encoded'] || item.content || item.contentSnippet || '';

    // Content & Image Extraction via Scraping
    try {
        const response = await fetch(item.link, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();

        // 1. Better Image Scraping (og:image or twitter:image)
        const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^">]+)"/) ||
            html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^">]+)"/);
        if (ogMatch) {
            imageUrl = ogMatch[1];
        }

        // 2. Full Content Scraping for ANN (or broad content sites)
        if (feedConfig.selector && html.includes('id="maincontent"') || html.includes('class="meat"')) {
            // Find the most appropriate container
            const bodyMatch = html.match(/<div[^>]+class="meat"[^>]*>([\s\S]*?)<\/div>/) ||
                html.match(/<div[^>]+id="maincontent"[^>]*>([\s\S]*?)<\/div>/);

            if (bodyMatch) {
                let scrapedBody = bodyMatch[1]
                    .replace(/<script[\s\S]*?<\/script>/gi, '')
                    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
                    .replace(/<div class="ad-container"[\s\S]*?<\/div>/gi, '');

                if (scrapedBody.length > fullContent.length) {
                    fullContent = scrapedBody;
                }
            }
        }

        // 3. Fallback Image from RSS
        if (!imageUrl) {
            if (item['media:content'] && item['media:content'].$) imageUrl = item['media:content'].$.url;
            else if (item['media:thumbnail'] && item['media:thumbnail'].$) imageUrl = item['media:thumbnail'].$.url;
            else {
                const imgMatch = fullContent.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) imageUrl = imgMatch[1];
            }
        }

    } catch (scrapeError) {
        console.error(`     ! Error scraping ${item.link}`);
    }

    function formatContent(html: string): string {
        let clean = html.replace(/\r\n/g, '\n');
        if (clean.includes('<p>') || clean.includes('<div>')) return clean;

        return clean
            .split(/\n\n+/)
            .map(para => {
                const trimmed = para.trim();
                if (!trimmed) return '';
                if (trimmed.length < 100 && !trimmed.endsWith('.') && !trimmed.match(/^[a-z]/)) {
                    return `<h2>${trimmed}</h2>`;
                }
                return `<p>${trimmed}</p>`;
            })
            .filter(p => p !== '')
            .join('\n');
    }

    const structuredContent = formatContent(fullContent);
    const cleanContent = sanitizeHtml(structuredContent, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h2', 'h3', 'blockquote', 'div', 'span']),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'width', 'height'],
            div: ['class', 'id'],
            span: ['class']
        }
    });

    const tags = item.categories || [];
    if (tags.length === 0) tags.push('News');

    const articleData = {
        title: item.title,
        slug: slug,
        content: cleanContent,
        contentSnippet: (item.contentSnippet || item.title).substring(0, 300),
        sourceUrl: item.link,
        sourceName: feedConfig.name,
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        tags: tags,
        imageUrl: imageUrl,
        createdAt: docSnap.exists ? (docSnap.data()?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await docRef.set(articleData);
    console.log(` + ${docSnap.exists ? 'Refreshed' : 'Saved'}: ${item.title}`);
}

async function fetchAndSaveNews() {
    // FORCE_UPDATE is now true by default to ensure quality refresh, but can be overridden
    const forceUpdate = process.env.FORCE_UPDATE_NEWS !== 'false';
    console.log(`Starting optimized news fetch (Force Update: ${forceUpdate})`);

    for (const feedConfig of FEEDS) {
        console.log(`Processing feed: ${feedConfig.name}`);
        try {
            const feed = await parser.parseURL(feedConfig.url);
            const itemsToProcess = feed.items.slice(0, feedConfig.limit || 15);

            // Parallel processing for speed
            await Promise.all(itemsToProcess.map(item => processItem(item, feedConfig, forceUpdate)));

        } catch (error) {
            console.error(`Error processing feed ${feedConfig.name}:`, error);
        }
    }
    console.log('News fetch completed successfully.');
}

fetchAndSaveNews().catch(console.error);
