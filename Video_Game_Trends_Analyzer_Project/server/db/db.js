/* eslint-disable camelcase */
import { MongoClient, ServerApiVersion } from 'mongodb';
import process from 'node:process';
process.loadEnvFile();
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

  /**
   * sungeun
   * this translate region code to column name in vg_sales data
   * vg_sales has field - NA_Sales, EU_Sales, JP_Sales, Other_Sales
   */
  regionField(region) {
    const key = String(region).toUpperCase();
    switch (key) {
    case 'NA': return 'NA_Sales';
    case 'EU': return 'EU_Sales';
    case 'JP': return 'JP_Sales';
    case 'OTHER': return 'Other_Sales';
    default: throw new Error(`E: region - ${region}`);
    }
  }

  /**
   * sungeun
   * Return the top selling game titles by region and year, collapsing duplicates across platforms
   * Otherwie, will get duplicates of the same game title
   * so thi summing by Name collapses all platform rows into a single total per game
   *region: NA, EU, JP, Other
   * limit: top 5
   * Return: [{ name, sales }]
   */
  async findTopGamesByRegionYear(region, year, limit = 5) {

    const regionField = this.regionField(region);
    const collection = this.db.collection(process.env.DEV_VG_COLLECTION);

    //get documents for given year where region sales more than 0
    const cursor = await collection.find({
      Year: Number(year),
      [regionField]: { $gt: 0}
    }).project({ Name: 1, [regionField]: 1, _id: 0 });

    const docs = await cursor.toArray();
    // sum sales per game name to collapse cross platform duplicates
    // here, key: Name, value: summed sales
    const totals = new Map();
    for (const doc of docs) {
      const name = doc.Name;
      //against undefined or null
      const sales = doc[regionField] || 0;
      totals.set(name, (totals.get(name) || 0) + sales);
    }

    //convert to array and sort descending by sales
    const sorted = Array.from(totals, ([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);

    //[{ name, sales }]
    return sorted;
  }

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
    const sorted = Array.from(totals, ([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);

    //[{ name, sales }]
    return sorted;
  }
}

export const db = new DB();
