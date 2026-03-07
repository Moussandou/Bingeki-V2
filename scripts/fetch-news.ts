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
    },
    {
        name: "Crunchyroll News",
        url: "https://cr-news-api-service.prd.crunchyrollsvc.com/v1/en-US/rss",
    },
    {
        name: "MyAnimeList News",
        url: "https://myanimelist.net/rss/news.xml",
    },
    {
        name: "ComicBook Anime",
        url: "https://comicbook.com/anime/rss",
    },
    {
        name: "SoraNews24",
        url: "https://soranews24.com/feed/",
    }
];

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

async function fetchAndSaveNews() {
    const forceUpdate = process.env.FORCE_UPDATE_NEWS === 'true';
    console.log(`Starting news fetch at ${new Date().toISOString()} (Force Update: ${forceUpdate})`);

    for (const feedConfig of FEEDS) {
        console.log(`Fetching feed: ${feedConfig.name}`);
        try {
            const feed = await parser.parseURL(feedConfig.url);

            for (const item of feed.items) {
                // Skip items that might not have a title or link
                if (!item.title || !item.link) continue;

                const slug = generateSlug(item.title);

                // Check if article already exists
                const docRef = db.collection('news').doc(slug);
                const docSnap = await docRef.get();

                if (docSnap.exists && !forceUpdate) {
                    console.log(` - Skipped: ${item.title} (already exists)`);
                    continue;
                }

                let imageUrl = null;
                let fullContent = item['content:encoded'] || item.content || item.contentSnippet || '';

                // Content & Image Extraction via Scraping
                try {
                    console.log(`   - Scraping page: ${item.link}`);
                    const response = await fetch(item.link, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    const html = await response.text();

                    // 1. Better Image Scraping (og:image or twitter:image)
                    const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^">]+)"/) ||
                        html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^">]+)"/);
                    if (ogMatch) {
                        imageUrl = ogMatch[1];
                        console.log(`     + Found image: ${imageUrl}`);
                    }

                    // 2. Full Content Scraping for ANN (RSS is too short)
                    if (feedConfig.name === "Anime News Network" && html.includes('id="bodytext"')) {
                        // Extract content inside <div id="bodytext">...</div>
                        const bodyMatch = html.match(/<div[^>]+id="bodytext"[^>]*>([\s\S]*?)<\/div>/);
                        if (bodyMatch) {
                            // Basic cleanup of extracted HTML to remove script tags or ads if any
                            let scrapedBody = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '');
                            // If we got significant content, use it
                            if (scrapedBody.length > fullContent.length) {
                                fullContent = scrapedBody;
                                console.log(`     + Scraped full body content (${scrapedBody.length} chars)`);
                            }
                        }
                    }

                    // 3. Fallback Image from RSS if scraping failed
                    if (!imageUrl) {
                        if (item['media:content'] && item['media:content'].$) imageUrl = item['media:content'].$.url;
                        else if (item['media:thumbnail'] && item['media:thumbnail'].$) imageUrl = item['media:thumbnail'].$.url;
                    }

                } catch (scrapeError) {
                    console.error(`     ! Error scraping ${item.link}:`, scrapeError);
                }

                // Helper to format content if it lacks structure
                function formatContent(html: string): string {
                    // Normalize line endings
                    let clean = html.replace(/\r\n/g, '\n');

                    // If it's already HTML structured, just clean up extra newlines
                    if (clean.includes('<p>') || clean.includes('<div>')) {
                        return clean;
                    }

                    // For plain text, convert double newlines to paragraphs
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

                // Basic Tags extraction
                const tags = item.categories || [];
                // Optional default tag
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
                console.log(` + ${docSnap.exists ? 'Updated' : 'Saved'}: ${item.title}`);
            }
        } catch (error) {
            console.error(`Error fetching feed ${feedConfig.name}:`, error);
        }
    }

    console.log('News fetch completed.');
}

fetchAndSaveNews().catch(console.error);
