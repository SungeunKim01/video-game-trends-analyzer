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

const dbUrl = process.env.DEV_ATLAS_URI;

let instance = null;

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
   * Yan Chi
   * Return the top selling game titles by a certain year, collapsing duplicates
   * Summing by Name = single row per game
   * limit: top 10
   * Return: [{ name, global_sales }]
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
   * Gets all distinct video game genres.
   * @author Jennifer
   * @returns Array of all video game genres.
   */
  async getDistinctGenres() {
    const collection = this.db.collection(process.env.DEV_VG_COLLECTION);
    const genres = await collection.distinct('Genre');
    return genres;
  }

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
}

export const db = new DB();
