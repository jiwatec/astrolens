# AstroLens ✦

**AstroLens** is an elegant, minimal, and responsive web application designed to explore the cosmos. Built with a "dark editorial" design philosophy, it strips away heavy UI frameworks and cluttered interfaces to focus entirely on breathtaking astronomical imagery provided by official NASA APIs.

## Features
- **Random Discovery**: Instantly fetch and display random space imagery from the NASA Astronomy Picture of the Day (APOD) API.
- **Curated Galleries**: Browse categorized collections of Constellations, Galaxies, Nebulae, and Planets using the NASA Images API.
- **Editorial UI/UX**: A highly refined, custom-built interface featuring high-contrast black/white layouts, delicate dotted borders, and beautiful serif typography (`Playfair Display`).
- **Resilient Backend architecture**: The Express server implements an intelligent **Database Fallback System**. Every successfully fetched NASA image is quietly archived in a Supabase PostgreSQL database. If the NASA API times out or fails during high traffic, the app seamlessly falls back to querying the local database, ensuring 100% uptime.
- **Server-Side Caching**: Implements an in-memory TTL caching layer to dramatically reduce API response times and avoid rate-limiting issues.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (DOM Manipulation, Fetch API).
- **Backend**: Node.js, Express.js.
- **Database**: Supabase (PostgreSQL).
- **External APIs**: NASA APOD API, NASA Image and Video Library API.

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/astrolens.git
   cd astrolens
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:
   ```env
   PORT=3000
   NASA_API_KEY=your_nasa_api_key_here
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ```
   *(You can obtain a NASA API key from [api.nasa.gov](https://api.nasa.gov/) and Supabase credentials from your Supabase dashboard.)*

4. **Initialize the Database:**
   Log into your Supabase Dashboard, navigate to the SQL Editor, and run the SQL script found in `supabase_setup.sql` to create the required `apod_history` table.

5. **Start the server:**
   ```bash
   npm start
   ```

6. **View the app:**
   Open your browser and navigate to `http://localhost:3000`.

## Design Philosophy
AstroLens was built as a strict departure from the heavy, complex CSS frameworks that dominate modern web development. It relies entirely on raw, vanilla CSS to achieve a premium "art gallery" or "newspaper" layout, proving that beautiful, robust applications can be built with minimal dependencies.

## License
This project was built for educational purposes. All imagery belongs to NASA and their respective creators.
