/* eslint-disable camelcase */
import express from 'express';
import { db, VALID_REGIONS } from '../db/db.js';
export const router = express.Router();

// GET /sales/years
router.get('/years', async (req, res) => {
  try {
    const years = await db.getAllYears();
    return res.json(years);
  } catch(error){
    console.error(error);
    return res.status(500).json({error: 'Server error'});
  }
});

// GET /sales/region/:region/:year
router.get('/region/:region/:year', async (req, res) => {
  try {
    // normalize the region code from the url to uppercase
    const regionKey = String(req.params.region).toUpperCase();
    //in Express, req.params.* are always strings, so 
    //first coerce to str (yearStr) to validate the exact format with the regex
    //then convert to number
    const yearStr = String(req.params.year);
    const year = Number(yearStr);
    const isValidYear = /^\d{4}$/.test(yearStr) && Number.isInteger(year);

    //respond with 400 
    //if region is not one of ['NA','EU','JP','OTHER'] OR the year is invalid
    if (!VALID_REGIONS.includes(regionKey) || !isValidYear) {
      return res.status(400).json({ error: 'Invalid region OR year' });
    }

    //ask the db for the top games for this region and year
    // so this will return like _id: 'Game name', total: 0.00
    const top = await db.findTopGamesAllRegionsByYear(regionKey, year, 5);

    // only need game names in payload, so no need total sales
    //thi will return name: 'Game name'
    const data = top.map(d => ({ name: d._id }));

    // get the list of countries for this region andyear from the Trends collection
    const countries = await db.countriesFromTrends(regionKey, year);

    //response that normalized region code, year in number, country list found in trends,
    // and top5 game names for the region and year
    return res.json({ region: regionKey, year, countries, data });

  } catch (err) {
    //unexpected error becomes server error
    console.error(err);
    return res.status(500).json({ error:'Server error'});
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
    // fetch top 10 games from db.js - findTopGamesByYear
    //filter by Year,
    // sum duplicate titles across platform,
    //sort descending by total sales.
    // an returns [{ name, global_sales }]
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


// ================= VIEW 3 =================
// GET /sales/genre/:genre AND /sales/platform/:platform
router.get('/genre/:genre', async (req, res) => {
  try {
    const genre = req.params.genre;

    // Get all distinct video game genres
    const allGenres = await db.getDistinctGenres();

    if (!allGenres.includes(genre)) {
      return res.status(400).json({error: 'Genre does not exist'});
    }

    const genreGames = await db.getYearlyGameCountByGenre(genre);
    const totalGames = await db.getTotalGamesPerYear();
    const totalGamesRes = new Map(totalGames.map(data => [
      data.year, data.total_games
    ]));

    // Iterate through both arrays and calculate percentage 
    const result = genreGames.map(data => {
      const totalGamesYearly = totalGamesRes.get(data.year) || 0;
      const percent = totalGamesYearly > 0 
        ? data.num_games / totalGamesYearly * 100 
        : 0;
      return {
        year: data.year,
        num_games: data.num_games,
        total_games: totalGamesYearly,
        percent: Number(percent.toFixed(2))
      };
    });

    return res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
