import { httpsCallable } from 'firebase/functions';
import { functions } from './config';

export const getWorkDetailsFn     = httpsCallable<{ id: number; type: string }, unknown>(functions, 'getWorkDetails');
export const searchWorksFn         = httpsCallable<{ query: string; type: string; page?: number; filters?: any; nsfwMode?: boolean }, unknown>(functions, 'searchWorks');
export const getWorkCharactersFn   = httpsCallable<{ id: number; type: string }, unknown>(functions, 'getWorkCharacters');
export const getWorkRelationsFn    = httpsCallable<{ id: number; type: string }, unknown>(functions, 'getWorkRelations');
export const getWorkPicturesFn     = httpsCallable<{ id: number; type: string }, unknown>(functions, 'getWorkPictures');
export const getWorkStatisticsFn   = httpsCallable<{ id: number; type: string }, unknown>(functions, 'getWorkStatistics');
export const getWorkRecommendationsFn = httpsCallable<{ id: number; type: string }, unknown>(functions, 'getWorkRecommendations');
export const getAnimeEpisodesFn    = httpsCallable<{ id: number; page?: number }, unknown>(functions, 'getAnimeEpisodes');
export const getAnimeStreamingFn   = httpsCallable<{ id: number }, unknown>(functions, 'getAnimeStreaming');
export const getAnimeStaffFn       = httpsCallable<{ id: number }, unknown>(functions, 'getAnimeStaff');
export const getAnimeThemesFn      = httpsCallable<{ id: number }, unknown>(functions, 'getAnimeThemes');
export const getWorkReviewsFn      = httpsCallable<{ id: number; type: string }, unknown>(functions, 'getWorkReviews');
export const getFRTranslationFn    = httpsCallable<{ id: number; type: string; titleFrench?: string; titleRomaji?: string }, string | null>(functions, 'getFRTranslation');
