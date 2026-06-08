# AstroLens ✦

Explore the cosmos through NASA's imagery — with an anonymous community to talk about it.

## What It Does

- **Discovery** — Random Astronomy Picture of the Day from NASA
- **Galleries** — Curated collections of constellations, galaxies, nebulae & planets
- **Community** — Anonymous discussions with auto-generated space aliases

## Tech Stack

HTML · CSS · JavaScript · Node.js · Express · Supabase · NASA APIs

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

Run `supabase_setup.sql` in your Supabase SQL Editor, then:

```bash
npm start
```

Open `http://localhost:3000`

## License

Built for educational purposes. All imagery belongs to NASA.
