
import { searchWorks } from './src/services/animeApi';
const run = async () => {
    const gantz = await searchWorks('Gantz', 'manga', { limit: 1 });
    const rezero = await searchWorks('Re:Zero kara Hajimeru Isekai Seikatsu', 'manga', { limit: 1 });
    console.log('Gantz:', gantz[0]?.images.jpg.large_image_url);
    console.log('Re:Zero:', rezero[0]?.images.jpg.large_image_url);
};
run();

