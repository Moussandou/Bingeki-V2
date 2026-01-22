
import { searchWorks } from '../src/services/animeApi';
const genres = {
  Seinen: '42',
  Shonen: '27',
  Romance: '22',
  Horreur: '14',
  Isekai: '62'
};

const run = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: Record<string, any> = {};
  for (const [name, id] of Object.entries(genres)) {
    const data = await searchWorks('', 'manga', {
      genres: id,
      order_by: 'popularity',
      sort: 'desc',
      min_score: 7
    });
    results[name] = data.slice(0, 3).map(m => ({
      title: m.title,
      type: 'Manga',
      score: m.score,
      image: m.images.jpg.large_image_url || m.images.jpg.image_url
    }));
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(JSON.stringify(results, null, 2));
};
run();

