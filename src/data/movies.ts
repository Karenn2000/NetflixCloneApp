import type { Movie } from '../types'

const movie = (
  id: number,
  title: string,
  rating: number,
  posterPath: string,
  backdropPath: string,
  overview: string,
  releaseDate: string,
  genreIds: number[],
): Movie => ({ id, title, rating, posterPath, backdropPath, overview, releaseDate, genreIds })

export const mockMovies: Movie[] = [
  movie(101, 'The Last Frontier', 8.4, 'photo-1517604931442-7e0c8ed2963c', 'photo-1489599849927-2ee91cede3ba', 'When a mysterious signal reaches the edge of the known world, one pilot risks everything to discover who sent it.', '2025-02-14', [12, 878, 28]),
  movie(102, 'Midnight in Tokyo', 7.9, 'photo-1489599849927-2ee91cede3ba', 'photo-1519608487953-e999c86e7455', 'A chance encounter on a rainy night sends two strangers on an unforgettable journey through the city.', '2024-11-08', [18, 10749]),
  movie(103, 'Wild Horizon', 8.1, 'photo-1500530855697-b586d89ba3ee', 'photo-1464822759023-fed622ff2c3b', 'A wildlife photographer returns home and finds that the wilderness she loves is on the brink of change.', '2025-01-24', [12, 18]),
  movie(104, 'The Grand Illusion', 7.6, 'photo-1519608487953-e999c86e7455', 'photo-1478720568477-152d9b164e26', 'A brilliant illusionist plans one final show, but the greatest trick is the secret hiding in plain sight.', '2024-09-19', [9648, 53]),
  movie(105, 'Fast Lane', 8.0, 'photo-1503376780353-7e6692767b70', 'photo-1519608487953-e999c86e7455', 'A former street racer is pulled back into the underground circuit for one last high-stakes run.', '2025-03-06', [28, 80]),
  movie(106, 'Cloud Nine', 7.4, 'photo-1518837695005-2083093ee35b', 'photo-1500530855697-b586d89ba3ee', 'A free-spirited crew of friends sets sail for the summer and discovers the best plans are the ones you never make.', '2024-07-12', [35, 10749]),
  movie(107, 'The Deep Blue', 8.7, 'photo-1518837695005-2083093ee35b', 'photo-1500530855697-b586d89ba3ee', 'Beneath the waves, a deep-sea researcher uncovers a discovery that could rewrite the story of life on Earth.', '2025-04-18', [12, 878, 53]),
  movie(108, 'Neon Nights', 7.8, 'photo-1519608487953-e999c86e7455', 'photo-1492684223066-81342ee5ff30', 'In a city that never sleeps, an ambitious musician gets one week to make her voice heard.', '2024-10-03', [18, 10402]),
  movie(109, 'The Good Company', 7.2, 'photo-1521737711867-e3b97375f902', 'photo-1521737711867-e3b97375f902', 'A small-town team with nothing in common discovers that winning together changes everything.', '2024-06-21', [35, 18]),
  movie(110, 'Shadow Protocol', 8.2, 'photo-1519608487953-e999c86e7455', 'photo-1519608487953-e999c86e7455', 'A retired intelligence officer must outthink the people who trained him when a hidden program resurfaces.', '2025-05-02', [28, 53, 80]),
  movie(111, 'Summer Somewhere', 7.7, 'photo-1500530855697-b586d89ba3ee', 'photo-1470770841072-f978cf4d019e', 'A long-delayed family reunion in a lakeside town brings old memories and new beginnings.', '2024-08-16', [35, 18]),
  movie(112, 'Orbit Zero', 8.5, 'photo-1451187580459-43490279c0fa', 'photo-1451187580459-43490279c0fa', 'The crew of a damaged station has one chance to get home before their oxygen runs out.', '2025-02-28', [878, 53]),
]

export const posterUrl = (path: string) =>
  path.startsWith('http')
    ? path
    : `https://images.unsplash.com/${path || 'photo-1489599849927-2ee91cede3ba'}?auto=format&fit=crop&w=600&q=80`

export const backdropUrl = (path: string) =>
  path.startsWith('http')
    ? path
    : `https://images.unsplash.com/${path || 'photo-1489599849927-2ee91cede3ba'}?auto=format&fit=crop&w=1600&q=85`


    