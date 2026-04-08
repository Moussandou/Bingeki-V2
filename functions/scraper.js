const cheerio = require('cheerio');

/**
 * Convert a title to a Nautiljon-compatible URL slug.
 * Lowercase, remove accents, replace spaces with hyphens, strip special chars.
 */
function toNautiljonSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Scrape the French synopsis from Nautiljon.
 * Tries titleFrench first, then titleRomaji as fallback slug.
 * Returns the synopsis string, or null if not found.
 */
/**
 * Generate slug variants: original + stripped of season suffix.
 * e.g. "Re:Zero kara Hajimeru Isekai Seikatsu 4th Season"
 *   → ["re-zero-kara-hajimeru-isekai-seikatsu-4th-season",
 *      "re-zero-kara-hajimeru-isekai-seikatsu"]
 */
function slugVariants(title) {
  const base = toNautiljonSlug(title);
  // Strip trailing season/part/cour markers
  const stripped = base
    .replace(/-(?:\d+(?:st|nd|rd|th)-season|saison-\d+|part-\d+|cour-\d+|season-\d+|\d+)$/, '')
    .replace(/-+$/, '');
  return stripped !== base ? [base, stripped] : [base];
}

async function scrapeFRSynopsis(titleFrench, titleRomaji, type) {
  const slugType = type === 'manga' ? 'mangas' : 'animes';
  const rawTitles = [titleFrench, titleRomaji].filter(Boolean);
  const candidates = [...new Set(rawTitles.flatMap(slugVariants))];

  for (const slug of candidates) {
    const url = `https://www.nautiljon.com/${slugType}/${slug}.html`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9',
        },
        signal: AbortSignal.timeout(12000),
      });

      if (res.status === 404) continue;
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Nautiljon places the synopsis in itemprop="description" or a .description div
      const synopsis =
        $('[itemprop="description"]').first().text().trim() ||
        $('.description_fr').first().text().trim() ||
        $('.description').first().text().trim() ||
        $('div.resume').first().text().trim();

      if (synopsis && synopsis.length > 30) {
        return synopsis;
      }
    } catch (err) {
      console.warn(`[Scraper] Failed for slug "${slug}":`, err.message);
    }
  }
  return null;
}

module.exports = { scrapeFRSynopsis };
