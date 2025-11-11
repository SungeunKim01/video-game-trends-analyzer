import express from 'express';
import { db } from '../db/db.js';
export const router = express.Router();

// GET /trends/region/:year/country/:country
router.get('/region/:year/country/:country', async (req, res) => {
  try{
    const year = Number(req.params.year);
    //validation
    if (Number.isNaN(year)) {
      return res.status(400).json({ error: 'Year must be a number' });
    }
    const country = String(req.params.country);
    // fetch all categories for a country in a given year
    const results = await db.getCategoriesByYearAndCountry(year, country);
    return res.json(results);
  } catch(error){
    console.error(error);
    return res.status(500).json({error: 'Server error'});
  }
});

// GET /trends/region/:year/category/:category
router.get('/region/:year/category/:category', async (req, res) => {
  try{
    const year = Number(req.params.year);
    //validation
    if (Number.isNaN(year)) {
      return res.status(400).json({ error: 'Year must be a number' });
    }
    const category = String(req.params.category);
    // fetch highest trends for a category in a given year
    // returns [{ query_en, region, rank }]
    const results = await db.getTopTrendsByYearAndCategory(year, category);

    //map data for formatting
    const data = results.map(trend => ({
      name: trend.query_en,
      region: trend.region,
      rank: trend.rank
    }));

    return res.json({year, data});
  } catch(error){
    console.error(error);
    return res.status(500).json({error: 'Server error'});
  }
});