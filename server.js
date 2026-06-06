/**
 * server.js — Express REST API for Astronomy Picture Gallery
 * Sources: NASA APOD API (hero) + NASA Images API (gallery) + Supabase (APOD history)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ── In-memory cache (1-hour TTL) ──────────────────────── */
const cache = {};
const CACHE_TTL = 3600000;

/* ── Category → NASA Images API search config ──────────── */
const CATEGORIES = {
  constellations: { q: 'constellation stars', req: 'constellation', exc: ['program', 'uss', 'press', 'conference', 'update'] },
  galaxies:       { q: 'galaxy hubble',       req: 'galaxy',        exc: ['ksc'] },
  nebulae:        { q: 'nebula hubble',       req: 'nebula',        exc: ['ksc'] },
  planets:        { q: 'planet solar system', req: 'planet',        exc: ['ksc', 'crew', 'spacex', 'directorate', 'model', 'earth observation'] },
  stars:          { q: 'star cluster',        req: 'star',          exc: ['iss', 'expedition', 'crew'] },
};

/* ── Helper: search NASA Images API with caching ───────── */
async function fetchNasaImages(category) {
  if (cache[category] && Date.now() - cache[category].ts < CACHE_TTL) {
    return cache[category].data;
  }

  var config = CATEGORIES[category];
  if (!config) throw new Error('Invalid category');

  var url = 'https://images-api.nasa.gov/search'
    + '?q=' + encodeURIComponent(config.q)
    + '&media_type=image&page_size=100';

  var res = await fetch(url, { timeout: 8000 });
  if (!res.ok) throw new Error('NASA Images API error: ' + res.status);
  var json = await res.json();

  var reqWord = config.req;
  var excWords = config.exc || [];

  var items = (json.collection.items || [])
    .filter(function (i) {
      if (!i.data || !i.data[0] || !i.links || !i.links[0] || !i.links[0].href) return false;
      var d = i.data[0];
      
      /* Must have a reasonable description */
      if (!d.description || d.description.length < 50) return false;
      
      var titleLower = (d.title || '').toLowerCase();
      var descLower = d.description.toLowerCase();
      var textToSearch = titleLower + ' ' + descLower;

      /* Check required word */
      if (textToSearch.indexOf(reqWord) === -1) return false;

      /* Exclude bad matches (like 'Constellation Program' or 'SpaceX Crew') */
      for (var w = 0; w < excWords.length; w++) {
        if (textToSearch.indexOf(excWords[w]) !== -1) return false;
      }

      return true;
    })
    .slice(0, 12)
    .map(function (i) {
      var d = i.data[0];
      var thumb = (i.links[0].href || '').replace('http://', 'https://');
      return {
        nasa_id:     d.nasa_id,
        title:       (d.title || 'Untitled').substring(0, 140),
        description: (d.description || '').substring(0, 800),
        image_url:   thumb,
        hd_url:      thumb.replace(/~thumb/, '~medium'),
        date:        d.date_created ? d.date_created.split('T')[0] : '',
        center:      d.center || '',
      };
    });

  cache[category] = { ts: Date.now(), data: items };
  return items;
}

/* ══ API Endpoints ═════════════════════════════════════════ */

/** GET /api/apod — Random Astronomy Picture of the Day */
app.get('/api/apod', async function (_req, res) {
  try {
    var url = 'https://api.nasa.gov/planetary/apod?api_key=' + process.env.NASA_API_KEY + '&count=1';
    var data = null;

    try {
      var nasaRes = await fetch(url, { timeout: 8000 });
      if (!nasaRes.ok) throw new Error('NASA APOD responded ' + nasaRes.status);
      var rawData = await nasaRes.json();
      data = Array.isArray(rawData) ? rawData[0] : rawData;

      /* Save to Supabase history */
      try {
        await supabase.from('apod_history').upsert({
          date: data.date, title: data.title,
          description: data.explanation,
          image_url: data.url, hd_url: data.hdurl || data.url,
          media_type: data.media_type, copyright: data.copyright || '',
        }, { onConflict: 'date' });
      } catch (dbErr) {
        console.warn('Could not save to Supabase history:', dbErr.message);
      }
    } catch (apiErr) {
      console.warn('NASA API failed, falling back to history:', apiErr.message);
      var result = await supabase.from('apod_history').select('*').order('date', { ascending: false }).limit(20);
      if (result.data && result.data.length > 0) {
        var row = result.data[Math.floor(Math.random() * result.data.length)];
        data = {
          title: row.title, explanation: row.description,
          url: row.image_url, hdurl: row.hd_url,
          date: row.date, media_type: row.media_type, copyright: row.copyright
        };
      } else {
        throw new Error('NASA API is down and no history available.');
      }
    }

    res.json({
      success: true,
      data: {
        title: data.title, description: data.explanation,
        image_url: data.url, hd_url: data.hdurl || data.url,
        date: data.date, media_type: data.media_type,
        copyright: data.copyright || '',
      },
    });
  } catch (err) {
    console.error('APOD error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/gallery?category=nebulae — NASA Images API search */
app.get('/api/gallery', async function (req, res) {
  try {
    var category = (req.query.category || '').toLowerCase();
    if (!CATEGORIES[category]) {
      return res.status(400).json({
        success: false,
        error: 'Valid categories: ' + Object.keys(CATEGORIES).join(', '),
      });
    }
    var data = await fetchNasaImages(category);
    res.json({ success: true, count: data.length, data: data });
  } catch (err) {
    console.error('Gallery error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/history — Past APODs from Supabase */
app.get('/api/history', async function (_req, res) {
  try {
    var result = await supabase
      .from('apod_history')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);
    if (result.error) throw result.error;
    res.json({ success: true, data: result.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* Catch-all */
app.get('*', function (_req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, function () {
  console.log('🚀 Server at http://localhost:' + PORT);
});
