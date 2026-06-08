# AstroLens ✦

Explore the cosmos through NASA's imagery — with an anonymous community to talk about it.

Built with vanilla HTML/CSS/JS, Node.js, Express, and Supabase.

## Features

- **Discovery** — Fetch random Astronomy Pictures of the Day from NASA's APOD API. Each image is archived to Supabase, so if NASA's API goes down the app falls back to local history.
- **Curated Galleries** — Browse Constellations, Galaxies, Nebulae & Planets via the NASA Images API. Results are cached server-side for 1 hour.
- **Community** — Anonymous discussion section. Every post gets a random space-themed alias (*Cosmic Voyager*, *Stellar Pulsar*) and colored avatar. Filter by topic. No accounts needed.
- **Lightbox** — Click any gallery image for an HD detail view with full description.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/apod` | Random Astronomy Picture of the Day |
| GET | `/api/gallery?category=nebulae` | NASA Images by category |
| GET | `/api/history` | Past APODs from database |
| GET | `/api/comments?topic=all` | Fetch community comments |
| POST | `/api/comments` | Post a comment `{ message, topic }` |

## Setup

```bash
git clone https://github.com/jiwatec/astrolens.git
cd astrolens
npm install
```

Create a `.env` file:

```env
PORT=3000
NASA_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

Get a NASA key from [api.nasa.gov](https://api.nasa.gov/) and Supabase credentials from your dashboard.

Run `supabase_setup.sql` in Supabase SQL Editor to create the `apod_history` and `comments` tables.

```bash
npm start
```

Open `http://localhost:3000`

## License

Built for educational purposes. All imagery belongs to NASA and their respective creators.
