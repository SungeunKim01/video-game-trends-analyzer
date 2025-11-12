import express from 'express';
import { db } from '../db/db.js';
export const router = express.Router();

/**
 * @swagger
 * /trends/region/{year}/country/{country}:
 *   get:
 *     summary: Trend categories for a country in a given year
 *     tags: [Trends]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category stats for the country
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Year must be a number
 *       500:
 *         description: Server error
 */
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

    // Even with invalid country, db can still return empty data
    if (!results || results.length === 0) {
      return res.status(500).json({ error: 'Server error' });
    }

    return res.json(results);
  } catch(error){
    console.error(error);
    return res.status(500).json({error: 'Server error'});
  }
});

/**
 * @swagger
 * /trends/region/{year}/category/{category}:
 *   get:
 *     summary: Top trends by category for a year
 *     tags: [Trends]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ranked queries for the category and year
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
 *                       region: { type: string }
 *                       rank: { type: integer }
 *       400:
 *         description: Year must be a number
 *       500:
 *         description: Server error
 */
// GET /trends/region/:year/country/:country/category/:category
router.get('/region/:year/country/:country/category/:category', async (req, res) => {
  try{
    const year = Number(req.params.year);
    //validation
    if (Number.isNaN(year)) {
      return res.status(400).json({ error: 'Year must be a number' });
    }
    const country = String(req.params.country);
    const category = String(req.params.category);
    // fetch highest trends for a category in a given year
    // returns [{ query_en, region, rank }]
    const results = await db.getTopTrendsByYearAndCategory(year, country, category);

    //map data for formatting
    const data = results.map(trend => ({
      year,
      name: trend.query_en,
      country: trend.country_code,
      rank: trend.rank
    }));

    return res.json(data);
  } catch(error){
    console.error(error);
    return res.status(500).json({error: 'Server error'});
  }
});
