import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Define the absolute path to locales folder
const LOCALES_DIR = path.resolve(process.cwd(), 'public/locales');

// Helper to load and combine all namespaces for a language
const loadTranslations = (lng: string) => {
    const lngDir = path.join(LOCALES_DIR, lng);
    const combined: Record<string, unknown> = {};

    if (!fs.existsSync(lngDir)) return combined;

    const files = fs.readdirSync(lngDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(lngDir, file), 'utf-8'));
        Object.assign(combined, content);
    });

    return combined;
};

describe('i18n translation consistency', () => {
    const frResources = loadTranslations('fr');
    const enResources = loadTranslations('en');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getAllKeys = (obj: Record<string, any>, prefix = ''): string[] => {
        return Object.keys(obj).reduce((res: string[], el: string) => {
            if (Array.isArray(obj[el])) {
                return [...res, prefix + el];
            } else if (typeof obj[el] === 'object' && obj[el] !== null) {
                return [...res, ...getAllKeys(obj[el], prefix + el + '.')];
            } else {
                return [...res, prefix + el];
            }
        }, []);
    };

    const frKeys = getAllKeys(frResources);
    const enKeys = getAllKeys(enResources);

    it('should have translations for both languages', () => {
        expect(frKeys.length).toBeGreaterThan(0);
        expect(enKeys.length).toBeGreaterThan(0);
    });

    it('should have a clean key count consistency', () => {
        // We use a small tolerance or just check if they are very close
        // but ideally they should be identical.
        expect(frKeys.length, `FR has ${frKeys.length} keys, EN has ${enKeys.length}`).toBe(enKeys.length);
    });

    it('all French keys should exist in English', () => {
        frKeys.forEach(key => {
            expect(enKeys, `Key "${key}" missing in English`).toContain(key);
        });
    });

    it('all English keys should exist in French', () => {
        enKeys.forEach(key => {
            expect(frKeys, `Key "${key}" missing in French`).toContain(key);
        });
    });

    it('no translation value should be empty', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkEmpty = (obj: Record<string, any>, path = '') => {
            Object.keys(obj).forEach(key => {
                const currentPath = path ? `${path}.${key}` : key;
                const value = obj[key];
                if (typeof value === 'string') {
                    expect(value.trim(), `Empty translation at ${currentPath}`).not.toBe('');
                } else if (typeof value === 'object' && value !== null) {
                    checkEmpty(value, currentPath);
                }
            });
        };
        checkEmpty(frResources, 'fr');
        checkEmpty(enResources, 'en');
    });
});
