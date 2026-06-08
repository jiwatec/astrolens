# AstroLens ✦ — Presentation Material

---

## Slide 1: Title

**AstroLens**
*An Editorial Astronomy Gallery powered by NASA APIs*

- Built with: Node.js · Express · Supabase · Vanilla JS
- Live at: `http://localhost:3000`
- Repository: `github.com/jiwatec/astrolens`

---

## Slide 2: Problem Statement

- NASA provides incredible astronomical data through public APIs, but there is no clean, minimal, and user-friendly interface to browse and explore this imagery.
- Existing tools are either too technical, cluttered, or lack community engagement.
- **Goal**: Build an elegant, editorial-style web application that makes exploring the cosmos accessible and enjoyable, while enabling anonymous community discussions around space imagery.

---

## Slide 3: Objectives

1. Fetch and display real-time astronomical imagery from NASA's APOD and Images APIs.
2. Provide curated, category-based galleries (Constellations, Galaxies, Nebulae, Planets).
3. Build a resilient backend with database fallback for 100% uptime.
4. Enable anonymous community discussions — no login or signup required.
5. Deliver a premium, responsive UI using only vanilla technologies (no CSS frameworks).

---

## Slide 4: Tech Stack

| Layer        | Technology                              |
|--------------|----------------------------------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript         |
| **Backend**  | Node.js, Express.js                     |
| **Database** | Supabase (PostgreSQL)                   |
| **APIs**     | NASA APOD API, NASA Image & Video Library API |
| **Fonts**    | Playfair Display (serif), Outfit (sans) |
| **Design**   | Dark editorial theme, glassmorphism, micro-animations |

---

## Slide 5: System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Discovery│  │ Gallery  │  │    Community       │  │
│  │  (APOD)  │  │ (Images) │  │  (Discussions)    │  │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       │              │                 │             │
└───────┼──────────────┼─────────────────┼─────────────┘
        │              │                 │
   ┌────▼──────────────▼─────────────────▼──────┐
   │           EXPRESS.JS SERVER (Node.js)       │
   │                                             │
   │  /api/apod    /api/gallery   /api/comments  │
   │  /api/history                               │
   │                                             │
   │  ┌────────────┐    ┌─────────────────────┐  │
   │  │  In-Memory │    │  Alias Generator    │  │
   │  │   Cache    │    │  (Space-themed)     │  │
   │  │  (1hr TTL) │    │                     │  │
   │  └────────────┘    └─────────────────────┘  │
   └────────┬──────────────────┬─────────────────┘
            │                  │
   ┌────────▼───┐     ┌───────▼────────┐
   │  NASA APIs │     │   SUPABASE     │
   │  ─ APOD    │     │  (PostgreSQL)  │
   │  ─ Images  │     │  ─ apod_history│
   │            │     │  ─ comments    │
   └────────────┘     └────────────────┘
```

---

## Slide 6: Feature — Random Discovery (APOD)

- Fetches a random **Astronomy Picture of the Day** from NASA's API.
- Displays the image with title, date, copyright, and full description.
- Every fetched APOD is automatically saved to Supabase for fallback.
- If NASA's API is down → server seamlessly serves from the local database.
- Users can click **"Discover"** to load a new random image.

**Key Endpoint**: `GET /api/apod`

---

## Slide 7: Feature — Curated Galleries

- Users can browse 4 curated categories:
  - 🌌 **Constellations**
  - 🔭 **Galaxies**
  - 💫 **Nebulae**
  - 🪐 **Planets**
- Each category queries the **NASA Image and Video Library API** with smart keyword filtering.
- Results are filtered server-side to exclude irrelevant matches (e.g. "Constellation Program", "SpaceX Crew").
- Responses are cached in-memory for 1 hour to reduce API calls.
- Lightbox modal opens on click for HD image view + full description.

**Key Endpoint**: `GET /api/gallery?category=nebulae`

---

## Slide 8: Feature — Anonymous Community

- A full discussion section — **no accounts, no login required**.
- Each post is automatically assigned:
  - A **random space-themed alias** (e.g. *"Cosmic Voyager"*, *"Stellar Pulsar"*, *"Lunar Photon"*)
  - A **unique colored avatar** with initials
- Users can **tag** their posts by topic (General, APOD, Galaxies, Nebulae, Planets, Stars, Questions).
- Feed can be **filtered by topic** using filter chips.
- Posts appear in real-time with slide-in animations.
- Character counter with color warnings (700+ yellow, 900+ red).
- Keyboard shortcut: **Ctrl+Enter** to post.

**Key Endpoints**:
- `GET /api/comments?topic=galaxies`
- `POST /api/comments` → `{ message, topic }`

---

## Slide 9: Database Design

### Table: `apod_history`
| Column      | Type        | Description                     |
|-------------|-------------|---------------------------------|
| id          | BIGSERIAL   | Primary key                     |
| date        | TEXT         | APOD date (unique)              |
| title       | TEXT         | Image title                     |
| description | TEXT         | Full explanation                |
| image_url   | TEXT         | Standard resolution URL         |
| hd_url      | TEXT         | High-definition URL             |
| media_type  | TEXT         | "image" or "video"              |
| copyright   | TEXT         | Photographer credit             |
| created_at  | TIMESTAMPTZ  | Auto-generated timestamp        |

### Table: `comments`
| Column       | Type        | Description                     |
|--------------|-------------|---------------------------------|
| id           | BIGSERIAL   | Primary key                     |
| alias        | TEXT         | Auto-generated space alias      |
| avatar_color | TEXT         | Hex color for avatar            |
| message      | TEXT         | Comment body (max 1000 chars)   |
| topic        | TEXT         | Topic tag (e.g. "galaxies")     |
| created_at   | TIMESTAMPTZ  | Auto-generated timestamp        |

Both tables use **Row Level Security (RLS)** with public read + insert policies.

---

## Slide 10: Backend — Resilience & Caching

### Database Fallback System
```
User Request → NASA API
                 ├─ Success → Save to Supabase → Respond
                 └─ Failure → Query Supabase history → Respond
```
- Ensures **100% uptime** even if NASA's servers are slow or down.

### In-Memory Cache
- Gallery results are cached with a **1-hour TTL**.
- Avoids repeated API calls for the same category.
- Dramatically improves response times on subsequent requests.

---

## Slide 11: Frontend Design

### Design Principles
- **Dark editorial aesthetic** — pure black (`#0a0a0a`) backgrounds
- **Playfair Display** serif for headings, **Outfit** sans-serif for body
- **Dotted borders** instead of solid lines for an elegant, newspaper feel
- **Animated starfield** canvas background with 260 twinkling stars
- **Skeleton loading states** — shimmer cards appear instantly while data loads
- **Micro-animations** — section fade-ins, card pop-ins, tab underlines
- **Zero CSS frameworks** — 100% vanilla CSS with custom design tokens

### Responsive
- Desktop → Tablet → Mobile breakpoints at 768px and 480px
- Nav collapses, grid adapts, images resize

---

## Slide 12: API Endpoints Summary

| Method | Endpoint                        | Description                          |
|--------|---------------------------------|--------------------------------------|
| GET    | `/api/apod`                     | Random Astronomy Picture of the Day  |
| GET    | `/api/gallery?category=nebulae` | NASA Images search by category       |
| GET    | `/api/history`                  | Past APODs from database             |
| GET    | `/api/comments?topic=all`       | Fetch community comments             |
| POST   | `/api/comments`                 | Post anonymous comment               |

---

## Slide 13: Security Considerations

- **Input Validation**: Messages are trimmed, length-checked (2–1000 chars), and sanitized server-side.
- **Row Level Security**: Supabase RLS policies restrict operations (read + insert only, no delete/update for comments).
- **No User Data Collected**: Fully anonymous — no IP logging, no cookies, no accounts.
- **API Key Protection**: NASA API key stored in `.env`, never exposed to the client.
- **XSS Prevention**: All user-generated content rendered via `textContent` (not `innerHTML`).

---

## Slide 14: Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| NASA API rate limiting & downtime | In-memory cache (1hr TTL) + Supabase fallback |
| Irrelevant search results from NASA Images API | Server-side keyword filtering with required/excluded word lists |
| Tab switching race condition | `expectedTab` guard pattern — stale API responses are discarded |
| Anonymous identity without accounts | Server-generated random space aliases + colored avatars |
| Premium UI without frameworks | Custom CSS design tokens, glassmorphism, micro-animations |

---

## Slide 15: Future Scope

- 🔍 **Search functionality** — let users search NASA's full image library
- ❤️ **Reactions** — anonymous emoji reactions on comments
- 🧵 **Threaded replies** — nested conversations under each comment
- 📅 **APOD Calendar** — browse APOD by date with a visual calendar
- 🌐 **Deployment** — host on Vercel/Render for public access
- 🔔 **Real-time updates** — Supabase Realtime for live comment streaming

---

## Slide 16: Demo

1. **Discovery** — Click "Discover" to fetch random APOD images
2. **Galleries** — Browse Constellations, Galaxies, Nebulae, Planets
3. **Lightbox** — Click any gallery card for HD view
4. **Community** — Post anonymous thoughts, filter by topic

**Live URL**: `http://localhost:3000`

---

## Slide 17: Conclusion

AstroLens demonstrates that a **full-stack web application** with real-time API integration, database persistence, anonymous community features, and a premium editorial UI can be built entirely with **vanilla web technologies** — no React, no Tailwind, no heavy frameworks.

The project prioritizes:
- **Resilience** over complexity
- **Elegance** over clutter
- **Accessibility** over gatekeeping

*Thank you!*
