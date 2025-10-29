import express from 'express';
import { db } from '../db/db.js';
export const router = express.Router();

/**
 * stub for countries
 * vgsales has no country field, so I will replace this with trends based query in later phase2...?
 */
const COUNTRIES_BY_REGION = {
  NA: ['United States', 'Canada', 'Mexico'],
  EU: ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy'],
  JP: ['Japan'],
  OTHER: ['Australia', 'Brazil', 'South Korea']
};

// GET /region/:region/:year
router.get('/region/:region/:year', async (req, res) => {
  try {
    const regionParam = req.params.region;
    //normalize to "NA" | "EU" | "JP" | "OTHER"
    const regionKey = String(regionParam).toUpperCase();
    //ex) "2010" to 2010 (number)
    const year = Number(req.params.year);

    //validation - region must be present and year must be a number,
    //so 400 - client sent invalid inpupt
    if (!regionParam || Number.isNaN(year)) {
      return res.status(400).json({ error: 'Invalid region or year' });
    }

    // fetch top 5 games from db.js - findTopGamesByRegionYear
    // this map  regionKey to the correct sales column,
    //filter by Year,
    // sum duplicate titles across platform,
    //sort descending by total sales.
    // an returns [{ name, sales }]
    const top = await db.findTopGamesByRegionYear(regionKey, year, 5);

    //remap { name, sales } to { name, [REGION]: sales }
    // and format to 2 decimals
    const data = top.map(g => ({
      name: g.name,
      [regionKey]: Number(g.sales.toFixed(2))
    }));

    //stub countries since vgsales.json has no country
    //if regionKey is not found, fall back to OTHER list
    const countries = COUNTRIES_BY_REGION[regionKey] ?? COUNTRIES_BY_REGION.OTHER;

    return res.json({ region: regionKey, year, countries, data });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /sales/global/:year
router.get('/global/:year', async (req, res) => {
  try{
    const year = Number(req.params.year);
    //validation
    if (Number.isNaN(year)) {
      return res.status(400).json({ error: 'Year must be a number' });
    }
    const results = await db.findTopGamesByYear(year, 10);

    //map data for formatting
    const data = results.map(game => ({
      name: game.name,
      // eslint-disable-next-line camelcase
      global_sales: game.sales
    }));

    return res.json({ year, data });

  } catch(error){
    console.error(error);
    return res.status(500).json({error: 'Server error'});
  }
});

// GET /sales/region/:region/:year/:country
//return country specific categories and searches from trends
router.get('/region/:region/:year/:country', (req, res) => {
  return res.status(501).json({
    error: 'Not implemented yet',
    route: '/sales/region/:region/:year/:country'
  });
});


// GET /sales/region/:region/:year/:category
// return top search results for a category
router.get('/region/:region/:year/:category', (req, res) => {
  return res.status(501).json({
    error: 'Not implemented yet'
  });
});