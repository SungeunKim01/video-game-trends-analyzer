/* eslint-disable camelcase */
import { MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  // only load .env if it exists
  process.loadEnvFile(envPath); 
}

const dbUrl = process.env.ATLAS_URI;

let instance = null;

// support only these region codes
export const VALID_REGIONS = ['NA', 'EU', 'JP', 'OTHER'];

// map sales region codes NA, EU, JP, OTHER to the textual region
//values used in Google Trends dataset
//OTHER is mapped to Otheer in the file
// handle it to exclude NA, EU JP, Global and gather everything else
const TRENDS_REGION_BY_SALES = {
  NA: 'North America',
  EU: 'Europe',
  JP: 'Japan',
  OTHER: 'Other'
};

const col = this.db.collection(process.env.DEV_VG_COLLECTION);

class DB {
  constructor() {
    //instance is the singleton, defined in outer scope
    if (!instance) {
      instance = this;
      this.mongoClient = null;
      this.db = null;
      this.collection = null;
    }
    return instance;
  }
  //Only connect to database if not already connected
  async connect(dbName) {
    if (instance.db){
      return;
    }
    this.mongoClient = new MongoClient(dbUrl, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await instance.mongoClient.connect();
    instance.db = await instance.mongoClient.db(dbName);
    // Send a ping to confirm a successful connection
    await instance.mongoClient.db(dbName).command({ ping: 1 });
    console.log('Successfully connected to MongoDB database ' + dbName);
  }
  
  //set the collection desired
  async setCollection(collectionName) {
    instance.collection = await instance.db.collection(collectionName);
  }

  // Create Many
  async createMany(docs) {
    const result = await this.collection.insertMany(docs);
    return result.insertedCount;
  }

  //close the connection when gracefully shutting down
  async close() {
    await instance.mongoClient.close();
    this.db = null;
    this.collection = null;
  }

  //your additional queries here

  // I refer this mongodb comparison operators website:
  //https://www.mongodb.com/docs/manual/reference/mql/query-predicates/comparison/
  // also refer this mongodb Aggregation operations website:
  //https://www.mongodb.com/docs/manual/aggregation/

  /**
   * @returns a list of countries for the chosen region
   * this try to return only countries that appear in the given year, and then
   * if none found for that year, fall back to all years
   * always exclude Global since it’s not country
   * and for OTHER, exclude NA, EU , JP, Global and combine the rest
   */
  async countriesFromTrends(regionKey, year) {
    const col = db.db.collection(process.env.DEV_TRENDS_COLLECTION);
    // translate region code as they appear in trends.json
    const mapped = TRENDS_REGION_BY_SALES[String(regionKey).toUpperCase()];

    /**
     * this is helper function to get unique country names using aggregation
     * @param baseQuery is the region filter
     * @param sameYear is either 4digit num or null to ignore year
     * exclude Global bc only want actual countries
     * $group by location, the countries to dedup, then $sort alphabetically
     */
    async function uniqueLocations(baseQuery, sameYear) {
      // ...baseQuery takes every key/value from baseQuery and copies them into new obj 
      //$ne is not equal
      const match = { ...baseQuery, location: { $ne: 'Global' } };
      if (sameYear !== null && sameYear !== undefined) {
        match.year = Number(sameYear);
      }

      const pipeline = [
        { $match: match },
        { $group: { _id: '$location' } },
        // here sort country names alphabetically
        { $sort: { _id: 1 } }
      ];
      const docs = await col.aggregate(pipeline).toArray();
      // for example, unwrap {_id: 'Canada'} to 'Canada'
      return docs.map(d => d._id);
    }

    // For these NA/EU/JP, region in trends is a single known label
    if (mapped && mapped !== 'Other') {
      //try the same year
      let list = await uniqueLocations({ region: mapped }, year);
      // if empty, fall back to all years for that region
      if (list.length === 0) {
        list = await uniqueLocations({ region: mapped }, null);
      }
      return list;
    }

    // for Other, colloct all region that are not in NA/EU/JP/Global
    //then gather their locations
    const excluded = ['North America', 'Europe', 'Japan', 'Global'];
    //discover which region labels belong to Other
    const otherRegions = await col.aggregate([
      //$nin is the specified field value is not in the specified array
      { $match: { region: { $nin: excluded } } },
      { $group: { _id: '$region' } }
    ]).toArray();
    const regionList = otherRegions.map(d => d._id);

    //try the specific year 1st, then all years
    //$in is for Matche any of the values specified in an array
    let list = await uniqueLocations({ region: { $in: regionList } }, year);
    if (list.length === 0) {
      list = await uniqueLocations({ region: {$in: regionList } }, null);
    }
    return list;
  }

  /**
   * Sungeun
   * Find top games for a given region and year using the vg_sales collection
   * regionCode will be one of NA, EU,JP, OTHER
   * year will be 4digit number like 2010
   * limit is how many top rows to return, here I need to find top5
   */
  async findTopGamesAllRegionsByYear(regionCode, year, limit = 5) {
    // map the incoming short region code to the actual sales field name in vg_sales.json
    const SALES_FIELD_BY_REGION = {
      NA: 'NA_Sales',
      EU: 'EU_Sales',
      JP: 'JP_Sales',
      OTHER: 'Other_Sales'
    };
    const regionField = SALES_FIELD_BY_REGION[String(regionCode).toUpperCase()];
    if (!regionField) {
      throw new Error(`Invalid region: ${regionCode}`);
    }
    const col = this.db.collection(process.env.DEV_VG_COLLECTION);

    const docs = await col.aggregate([
      //keep only the requested year & rows where region sales bigger than 0 after cast
      { $match: { Year: Number(year), [regionField]: { $gt: 0 } } },

      // collapse duplicates across platforms by game Name
      // and sum the region sales over all platforms
      { $group: {_id: '$Name', total: { $sum: `$${regionField}` }} },

      //sort by total descending & return top5
      { $sort: { total: -1 } },
      { $limit: Number(limit) }
    ]).toArray();
    return docs;
  }


  /**
   * Return the top selling game titles by a certain year, collapsing duplicates
   * Summing by Name = single row per game
   * limit: top 10
   * @author Yan Chi
   * @returns: [{ name, global_sales }]
   */

  async findTopGamesByYear(year, limit = 10){
    const collection = this.db.collection(process.env.DEV_VG_COLLECTION);

    //get documents for given year where global sales more than 0
    const cursor = await collection.find({
      Year: Number(year),
      Global_Sales: { $gt: 0}
    }).project({ Name: 1, Global_Sales: 1, _id: 0 });

    const docs = await cursor.toArray();
    // sum sales per game name to collapse cross platform duplicates
    // here, key: Name, value: summed sales
    const totals = new Map();
    for (const doc of docs) {
      const name = doc.Name;
      //against undefined or null
      const sales = doc.Global_Sales || 0;
      totals.set(name, (totals.get(name) || 0) + sales);
    }

    //convert to array and sort descending by sales
    const sorted = Array.from(totals, ([name, sales]) => ({ name, sales })).
      sort((a, b) => b.sales - a.sales).
      slice(0, limit);

    //[{ name, global_sales }]
    return sorted;
  }

  /**
   * Gets all years from both collections.
   * @author Yan Chi
   * @returns Array of all possible years.
   */
  async getAllYears(){
    const gameCollection = this.db.collection(process.env.DEV_VG_COLLECTION);
    const trendCollection = this.db.collection(process.env.DEV_TRENDS_COLLECTION);
    
    //get distinct years from trend collection using aggregate
    const trendYearsAg = await trendCollection.aggregate([
      { $group: { _id: '$year' } }
    ]).toArray();
    const trendYears = trendYearsAg.map(d => d._id);

    //get years from game collection that exist in trendYears
    const commonYearsAg = await gameCollection.aggregate([
      { $match: { Year: { $in: trendYears } } },
      { $group: { _id: '$Year' } },
      { $sort: { _id: 1 } }
    ]).toArray();

    return commonYearsAg.map(d => d._id);
  }

  // Reference: https://www.mongodb.com/docs/manual/aggregation/
  /**
   * Gets all categories for a country per year.
   * @author Yan Chi
   * @returns Array with the year and total games released that year.
   */
  async getCategoriesByYearAndCountry(year, country) {
    const collection = this.db.collection(process.env.DEV_TRENDS_COLLECTION);
    const cursor = await collection.aggregate([
      { $match: { year: Number(year), country_code: country } },
      { $group: { _id: '$category_en' } },
      { $sort: { _id: 1 } }
    ]);
    
    const docs = await cursor.toArray();
    //[{ category_en }]
    return docs.map(d => d._id);
  }

  /**
   * Return the highest rank trends in a certain year for a certain category
   * @author Yan Chi
   * @returns: [{ query_en, region, rank }]
   */
  async getTopTrendsByYearAndCategory(year, category){
    const collection = this.db.collection(process.env.DEV_TRENDS_COLLECTION);

    //get documents for given year depending on category
    const cursor = await collection.find({
      year: Number(year),
      category_en: category
    }).project({ query_en: 1, region: 1, rank: 1, _id: 0 });

    const docs = await cursor.toArray();

    //convert to array and sort ascending by sales
    const sorted = docs.
      sort((a, b) => a.rank - b.rank);

    //[{ query_en, region, rank }]
    return sorted;
  }

  //================= VIEW 3 =================
  // Reference: https://www.mongodb.com/docs/manual/aggregation/
  /**
   * Gets the total number of games released per year.
   * @author Jennifer
   * @returns Array with the year and total games released that year.
   */
  async getTotalGamesPerYear() {
    const collection = this.db.collection(process.env.DEV_VG_COLLECTION);
    const cursor = collection.aggregate([
      { $group: { _id: '$Year', total_games: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const result = [];
    for (const doc of cursor) {
      result.push({ year: doc._id, total_games: doc.total_games });
    }
    return result;
  }

  /**
   * Gets all games of that genre. Grouped by year.
   * @author Jennifer
   * @param {string} genre 
   * @returns Array of number of games grouped by years. 
   */
  async getYearlyGameCountByGenre(genre) {
    const collection = this.db.collection(process.env.DEV_VG_COLLECTION);
    const cursor = await collection.aggregate([
      { $match: { Genre: genre } },
      { $group: { _id: '$Year', num_games: { $sum: 1 } }},
      { $sort: { _id: 1 }}
    ]);
    const result = [];
    const docs = await cursor.toArray();
    for (const doc of docs) {
      result.push({ year: doc._id, num_games: doc.num_games });
    }
    return result;
  }

  /**
   * Get all distinct genres from the Google Trends dataset using aggregation on category_en
   * Each value is taken from the category_en field, this is genre
   * @author Sungeun
   * @returns Array of distinct genre names from trends.json
   *
   */
  async getDistinctGenresFromTrends() {
    const colTrends = this.db.collection(process.env.DEV_TRENDS_COLLECTION);
    const docs = await colTrends.aggregate([
      { $match: { category_en: { $type: 'string' } } },
      { $group: { _id: '$category_en' } },
      { $sort: { _id: 1 } }
    ]).toArray();

    return docs
      .map(d => (typeof d._id === 'string' ? d._id.trim() : ''))
      .filter(v => v.length > 0);
  }

  /**
   * Get all distinct values based on the chosen type for View 3.
   * so if type is genre, get values from trends.category_en thru aggregation
   * if type is platform,get values from vgsales.Platform thru aggregation
   * @author Sungeun
   */
  async getDistinctByType(type) {
    if (type === 'genre') {
      return await this.getDistinctGenresFromTrends();
    }
    if (type === 'platform') {
       const colVG = this.db.collection(process.env.DEV_VG_COLLECTION);

      const docs = await colVG.aggregate([
        { $match: { Platform: { $type: 'string' } } },
        { $group: { _id: '$Platform' } },
        { $sort: { _id: 1 } }
      ]).toArray();

      return docs
        .map(d => (typeof d._id === 'string' ? d._id.trim() : ''))
        .filter(v => v.length > 0);
    }
    return [];
  }

  /**
   * Get all games for the chosen type (genre or platform) grouped by year
   *If type is genre, give all the matches vgsales.Genre using value from trends.category_en
   * If type is platform, give all the matches vgsales.Platform directly
   * @author Sungeun
   * @param {string} type  Either 'genre' or 'platform'
   * @param {string} value The selected genre or platform
   * @returns Array of objects with { year, num_games }
   */
  async getYearlyGameCountByType(type, value) {
    const colVG = this.db.collection(process.env.DEV_VG_COLLECTION);
    const match = (type === 'genre')
      ? { Genre: value }
      : { Platform: value };

    const docs = await colVG.aggregate([
      { $match: match },
      { $group: { _id: '$Year', num_games: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    return docs.map(d => ({ year: d._id, num_games: d.num_games }));
  }
}

export const db = new DB();
