#!/usr/bin/env node

const DEFAULT_BASE_URL = 'https://bingeki.web.app';
const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRIES = 2;
const DEFAULT_PATHS = [
  '/fr',
  '/en',
  '/fr/dashboard',
  '/en/dashboard',
  '/fr/library',
  '/en/library',
  '/fr/news',
  '/en/news',
  '/fr/social',
  '/en/social',
  '/fr/settings',
  '/en/settings',
  '/fr/contact',
  '/en/contact'
];

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeComparableUrl(input) {
  try {
    const parsed = new URL(input);
    const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
    const search = parsed.search || '';
    return `${parsed.origin}${pathname}${search}`;
  } catch {
    return input;
  }
}

function extractTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractMeta(html, attr, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `<meta\\s+[^>]*${attr}=["']${escapedKey}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    'i'
  );
  const reversedRegex = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${escapedKey}["'][^>]*>`,
    'i'
  );

  const direct = html.match(regex);
  if (direct) return direct[1].trim();

  const reversed = html.match(reversedRegex);
  return reversed ? reversed[1].trim() : '';
}

function extractCanonical(html) {
  const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function testTag(label, value, validator) {
  if (!value) return { ok: false, reason: 'missing' };
  if (validator && !validator(value)) return { ok: false, reason: `${label} invalid: ${value}` };
  return { ok: true };
}

async function testUrl(baseUrl, path) {
  const url = `${baseUrl}${path}`;
  const timeoutMs = Number(getArg('--timeout') || DEFAULT_TIMEOUT_MS);
  const retries = Number(getArg('--retries') || DEFAULT_RETRIES);
  let response = null;
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      response = await fetch(url, {
        headers: {
          'user-agent': 'seo-test-script/1.1 (+seo-check)'
        },
        signal: controller.signal
      });
      clearTimeout(timer);
      lastError = null;
      break;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < retries) {
        await sleep(400 * (attempt + 1));
      }
    }
  }

  if (!response) {
    return {
      url,
      ok: false,
      errors: [`request failed after ${retries + 1} attempt(s): ${lastError instanceof Error ? lastError.message : String(lastError)}`]
    };
  }

  if (!response.ok) {
    return {
      url,
      ok: false,
      errors: [`http_status=${response.status}`]
    };
  }

  const html = await response.text();
  const title = extractTitle(html);
  const description = extractMeta(html, 'name', 'description');
  const ogTitle = extractMeta(html, 'property', 'og:title');
  const ogDescription = extractMeta(html, 'property', 'og:description');
  const ogImage = extractMeta(html, 'property', 'og:image');
  const ogUrl = extractMeta(html, 'property', 'og:url');
  const ogLocale = extractMeta(html, 'property', 'og:locale');
  const twitterTitle = extractMeta(html, 'name', 'twitter:title');
  const twitterDescription = extractMeta(html, 'name', 'twitter:description');
  const twitterImage = extractMeta(html, 'name', 'twitter:image');
  const twitterCard = extractMeta(html, 'name', 'twitter:card');
  const canonical = extractCanonical(html);

  const errors = [];
  const checks = [
    ['title', testTag('title', title)],
    ['description', testTag('description', description)],
    ['og:title', testTag('og:title', ogTitle)],
    ['og:description', testTag('og:description', ogDescription)],
    ['og:image', testTag('og:image', ogImage, (v) => v.startsWith('http'))],
    ['og:url', testTag('og:url', ogUrl, (v) => v.startsWith('http'))],
    ['og:locale', testTag('og:locale', ogLocale)],
    ['twitter:title', testTag('twitter:title', twitterTitle)],
    ['twitter:description', testTag('twitter:description', twitterDescription)],
    ['twitter:image', testTag('twitter:image', twitterImage, (v) => v.startsWith('http'))],
    ['twitter:card', testTag('twitter:card', twitterCard)],
    ['canonical', testTag('canonical', canonical, (v) => v.startsWith('http'))]
  ];

  for (const [label, result] of checks) {
    if (!result.ok) errors.push(`${label}: ${result.reason}`);
  }

  if (canonical && ogUrl && normalizeComparableUrl(canonical) !== normalizeComparableUrl(ogUrl)) {
    errors.push(`canonical and og:url mismatch (${canonical} vs ${ogUrl})`);
  }

  return {
    url,
    ok: errors.length === 0,
    errors
  };
}

async function main() {
  const baseUrl = (getArg('--base') || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const pathsArg = getArg('--paths');
  const paths = pathsArg ? pathsArg.split(',').map((p) => p.trim()).filter(Boolean) : DEFAULT_PATHS;
  const strict = hasFlag('--strict');

  console.log(`SEO test base: ${baseUrl}`);
  console.log(`URLs to test: ${paths.length}`);
  console.log('');

  let failed = 0;
  for (const path of paths) {
    try {
      const result = await testUrl(baseUrl, path);
      if (result.ok) {
        console.log(`PASS ${result.url}`);
      } else {
        failed += 1;
        console.log(`FAIL ${result.url}`);
        for (const error of result.errors) {
          console.log(`  - ${error}`);
        }
      }
    } catch (error) {
      failed += 1;
      console.log(`FAIL ${baseUrl}${path}`);
      console.log(`  - request error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('');
  console.log(`Result: ${paths.length - failed}/${paths.length} passed`);

  if (strict && failed > 0) {
    process.exit(1);
  }
}

main();
