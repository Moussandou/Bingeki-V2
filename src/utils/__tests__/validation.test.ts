import { describe, it, expect } from 'vitest';
import { isValidImageSrc } from '../validation';

describe('validation', () => {
    describe('isValidImageSrc', () => {
        describe('valid sources', () => {
            it('should accept HTTPS URLs', () => {
                expect(isValidImageSrc('https://example.com/image.png')).toBe(true);
                expect(isValidImageSrc('https://cdn.mysite.com/path/to/image.jpg')).toBe(true);
            });

            it('should accept HTTP URLs', () => {
                expect(isValidImageSrc('http://example.com/image.png')).toBe(true);
            });

            it('should accept data:image URIs', () => {
                expect(isValidImageSrc('data:image/png;base64,abc123')).toBe(true);
                expect(isValidImageSrc('data:image/jpeg;base64,xyz789')).toBe(true);
                expect(isValidImageSrc('data:image/gif;base64,abc')).toBe(true);
            });
        });

        describe('invalid sources', () => {
            it('should reject empty strings', () => {
                expect(isValidImageSrc('')).toBe(false);
            });

            it('should reject javascript: URIs (XSS prevention)', () => {
                expect(isValidImageSrc('javascript:alert(1)')).toBe(false);
                expect(isValidImageSrc('javascript:void(0)')).toBe(false);
            });

            it('should reject data: URIs that are not images', () => {
                expect(isValidImageSrc('data:text/html,<script>alert(1)</script>')).toBe(false);
                expect(isValidImageSrc('data:application/json,{}')).toBe(false);
            });

            it('should reject file: protocol', () => {
                expect(isValidImageSrc('file:///etc/passwd')).toBe(false);
            });

            it('should reject ftp: protocol', () => {
                expect(isValidImageSrc('ftp://example.com/image.png')).toBe(false);
            });

            it('should reject random strings', () => {
                expect(isValidImageSrc('not-a-url')).toBe(false);
                expect(isValidImageSrc('random text')).toBe(false);
            });
        });
    });
});
