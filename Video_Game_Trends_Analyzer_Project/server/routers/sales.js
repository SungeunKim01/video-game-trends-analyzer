/* eslint-disable camelcase */
import express from 'express';
import { db, VALID_REGIONS, VALID_TYPES } from '../db/db.js';
export const router = express.Router();

/**
 * @swagger
 * /sales/years:
 *   get:
 *     summary: All years available in the datasets
 *     tags: [Sales]
 *     description: Returns the union of years from the Trends and VG Sales collections.
 *     responses:
 *       200:
 *         description: Array of years
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 *       500:
 *         description: Server error
 */
// GET /sales/years
// returns aggregate of years from trends and games tables
router.get('/years', async (req, res) => {
  try {
    const years = await db.getAllYears();
    return res.json(years);
  } catch(error){
    console.error(error);
    return res.status(500).json({error: 'Server error'});
  }
});

// ================= VIEW 1 =================
/**
 * @swagger
 * /sales/global/{year}:
 *   get:
 *     summary: Top 10 global games for a year
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Four digit year
 *     responses:
 *       200:
 *         description: Top games and global sales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       global_sales: { type: number }
 *       400:
 *         description: Year must be a number
 *       500:
 *         description: Server error
 */
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

// ================= VIEW 2 =================
/**
 * @swagger
 * /sales/region/{region}/{year}:
 *   get:
 *     summary: Top 5 games and countries for a region and year
 *     tags: [Sales]
 *     description: Region codes are NA, EU, JP, OTHER. GLOBAL
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *           enum: [NA, EU, JP, OTHER, GLOBAL]
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Countries list and top 5 game names for the region/year
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 region: { type: string }
 *                 year: { type: integer }
 *                 countries:
 *                   type: array
 *                   items:
 *                     type: string
 *                 topVgData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *       400:
 *         description: Invalid region OR year
 *       500:
 *         description: Server error
 */
// GET /sales/region/:region/:year
router.get('/region/:region/:year', async (req, res) => {
  try {
    
    const regionKey = String(req.params.region).toUpperCase();

    /* in Express, req.params.* are always strings:
     * coerce to str (yearStr) to validate the format with the regex,
     * then convert to number
    */
    const yearStr = String(req.params.year);
    const year = Number(yearStr);
    const isValidYear = /^\d{4}$/.test(yearStr) && Number.isInteger(year);

    if (!VALID_REGIONS.includes(regionKey) || !isValidYear) {
      return res.status(400).json({ error: 'Invalid region OR year' });
    }

    let topVgData = [];
    let countries = [];

    if (regionKey === 'GLOBAL') {

      // Top 5 Global Games
      const top = await db.findTopGamesByYear(year, 5);
      topVgData = top.map(d => ({ name: d.name }));
      countries = await db.groupCountriesByRegion();

    } else {

      // Top 5 Games by Region
      // return _id: 'Game name', total: 0.00
      const top = await db.findTopGamesAllRegionsByYear(regionKey, year, 5);

      // only need game names in payload, so no need total sales
      // this will return name: 'Game name'
      topVgData = top.map(d => ({ name: d._id }));

      // get the list of countries for this region and year from the Trends collection
      countries = await db.countriesFromTrends(regionKey, year);
    }

    // response that normalized region code, year in number, country list found in trends,
    // and top5 game names for the region and year
    return res.json({ region: regionKey, year, countries, topVgData });

  } catch (err) {
    // unexpected error becomes server error
    console.error(err);
    return res.status(500).json({ error:'Server error'});
  }
});

// ================= VIEW 3 =================
/**
 * @swagger
 * /sales/{type}/{value}:
 *   get:
 *     summary: Yearly counts and percentages for a genre or platform
 *     tags: [Sales]
 *     description: Computes {year, num_games, total_games, percent} per year.
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [genre, platform]
 *         description: Choose "genre" or "platform"
 *       - in: path
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: The selected genre or platform value
 *     responses:
 *       200:
 *         description: Time series rows
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   year: { type: integer }
 *                   num_games: { type: integer }
 *                   total_games: { type: integer }
 *                   percent: { type: number }
 *       400:
 *         description: Invalid type or unknown value
 *       500:
 *         description: Server error
 */
/**
 * GET /api/sales/:type/:value
 * View3 time series for a given genre OR platform
 * @author Sungeun
 * @param {string} req.params.type genre or platform
 * @param {string} req.params.value selected genre or platform
 * @returns {Array<{year:number,num_games:number,total_games:number,percent:number}>}
 */
router.get('/:type/:value', async (req, res) => {
  try {
    const type = String(req.params.type).toLowerCase();
    const value = req.params.value;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: 'E: invalid type - Use "genre" OR "platform"' });
    }

    const allowedValues = await db.getDistinctByType(type);
    if (!allowedValues.includes(value)) {
      return res.status(400).json({ error: `${type} does not exist: ${value}` });
    }

    const part = await db.getYearlyGameCountByType(type, value);
    const totals = await db.getTotalGamesPerYear();

    const totalMap = new Map(totals.map(d => [d.year, d.total_games]));
    const rows = part.map(d => {
      const total = totalMap.get(d.year) || 0;
      const percent = total > 0 ? (d.num_games / total) * 100 : 0;
      return {
        year: d.year,
        num_games: d.num_games,
        total_games: total,
        percent: Number(percent.toFixed(2))
      };
    });

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /sales/{type}:
 *   get:
 *     summary: Distinct values for genre or platform
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [genre, platform]
 *     responses:
 *       200:
 *         description: Array of distinct values
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Invalid type
 *       500:
 *         description: Server error
 */
// this, we can remove later
/**
 * GET /api/sales/:type
 * this return distinct list for dropdown
 * @author Sungeun
 * @param {string} req.params.type genre or platform
 * @returns {string[]} distinct values
 */
router.get('/:type', async (req, res) => {
  try {
    const type = String(req.params.type).toLowerCase();
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: 'E: invalid type - Use "genre" OR "platform"' });
    }
    const values = await db.getDistinctByType(type);
    return res.json(values);
  } catch {
    return res.status(500).json({ error: 'server error' });
  }
});
