import { MongoClient, ServerApiVersion } from 'mongodb';
import process from 'node:process';
process.loadEnvFile();
const dbUrl = process.env.ATLAS_URI;

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

  /**
   * sungeun
   * this translate region code to column name in vg_sales data
   * vg_sales has field - NA_Sales, EU_Sales, JP_Sales, Other_Sales
   */
  regionField(region) {
    const key = String(region).toUpperCase();
    switch (key) {
      case "NA": return "NA_Sales";
      case "EU": return "EU_Sales";
      case "JP": return "JP_Sales";
      case "OTHER": return "Other_Sales";
      default: throw new Error(`E: region - ${region}`);
    }
  }
}

export const db = new DB();
