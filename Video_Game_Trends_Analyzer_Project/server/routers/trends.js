import express from 'express';
import { db } from '../db/db.js';
export const router = express.Router();

// GET /trends/global/:year
router.get('/global/:year', async (req, res) => {
  try{
    const year = Number(req.params.year);
    //validation
    if (Number.isNaN(year)) {
      return res.status(400).json({ error: 'Year must be a number' });
    }
    // fetch top 5 global trends from db.js 
    // an returns [{ query_en, region, rank }]
    const results = await db.findTopGlobalTrendsByYear(year, 5);

    //map data for formatting
    const data = results.map(trend => ({
      name: trend.query_en,
      region: trend.region,
      rank: trend.rank
    }));

    return res.json({ year, data });

  } catch(error){
    console.error(error);
    return res.status(500).json({error: 'Server error'});
  }
});