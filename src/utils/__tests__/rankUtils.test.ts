import { describe, it, expect } from 'vitest';
import { calculateRank, getRankColor } from '../rankUtils';

describe('rankUtils', () => {
    describe('calculateRank', () => {
        it('should return F for levels below 5', () => {
            expect(calculateRank(0)).toBe('F');
            expect(calculateRank(1)).toBe('F');
            expect(calculateRank(4)).toBe('F');
        });

        it('should return E for levels 5-9', () => {
            expect(calculateRank(5)).toBe('E');
            expect(calculateRank(9)).toBe('E');
        });

        it('should return D for levels 10-19', () => {
            expect(calculateRank(10)).toBe('D');
            expect(calculateRank(19)).toBe('D');
        });

        it('should return C for levels 20-29', () => {
            expect(calculateRank(20)).toBe('C');
            expect(calculateRank(29)).toBe('C');
        });

        it('should return B for levels 30-49', () => {
            expect(calculateRank(30)).toBe('B');
            expect(calculateRank(49)).toBe('B');
        });

        it('should return A for levels 50-74', () => {
            expect(calculateRank(50)).toBe('A');
            expect(calculateRank(74)).toBe('A');
        });

        it('should return S for levels 75-99', () => {
            expect(calculateRank(75)).toBe('S');
            expect(calculateRank(99)).toBe('S');
        });

        it('should return 臭 for level 100+', () => {
            expect(calculateRank(100)).toBe('臭');
            expect(calculateRank(150)).toBe('臭');
        });
    });

    describe('getRankColor', () => {
        it('should return correct color for each rank', () => {
            expect(getRankColor('臭')).toBe('#000000');
            expect(getRankColor('S')).toBe('#D4AF37');
            expect(getRankColor('A')).toBe('#FF4500');
            expect(getRankColor('B')).toBe('#8A2BE2');
            expect(getRankColor('C')).toBe('#0000CD');
            expect(getRankColor('D')).toBe('#228B22');
            expect(getRankColor('E')).toBe('#696969');
        });

        it('should return black for unknown ranks', () => {
            expect(getRankColor('X')).toBe('#000000');
            expect(getRankColor('')).toBe('#000000');
        });
    });
});
