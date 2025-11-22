/* eslint-disable camelcase */
import {db} from '../db/db.js';
import fs from 'node:fs/promises';
import path from 'node:path';

// process.loadEnvFile(path.resolve('.env'));

const vgFilepath = path.resolve('data', 'vgsales.json');
const trendsFilepath = path.resolve('data', 'trends.json');

// Wrap current seeding code in exported function runSeed() 
// so tests can call it after stubbing fs and db
export async function runSeed() {
  try {
    await db.connect(process.env.DB);
    
    // Load the 2 json files
    const rawVGSales = await fs.readFile(vgFilepath, 'utf8');
    const vgsalesData = JSON.parse(rawVGSales);
    const rawGoogTrends = await fs.readFile(trendsFilepath, 'utf8');
    const trendsData = JSON.parse(rawGoogTrends);
    
    // Insert in Video Game collection
    await db.setCollection(process.env.VG_COLLECTION);
    const vgSalesNum = await db.createMany(vgsalesData);
    console.log(`Inserted ${vgSalesNum} video games sales entries.`);
    // Insert in Google Trends collection
    await db.setCollection(process.env.TRENDS_COLLECTION);
    const trendsNum = await db.createMany(trendsData);
    console.log(`Inserted ${trendsNum} Google query data.`);
    
    //get collection obj to use createIndex()
    const gamesCol = db.db.collection(process.env.VG_COLLECTION);
    const trendsCol = db.db.collection(process.env.TRENDS_COLLECTION);

    //INDEXES FOR VG SALES FOR PERFORMANCE
    await gamesCol.createIndex({ Year: 1 });
    //these are for findTopGamesAllRegionsByYear 
    //so it doesn't scan through whole collection each time
    await gamesCol.createIndex({ Year: 1, NA_Sales: 1 });
    await gamesCol.createIndex({ Year: 1, EU_Sales: 1 });
    await gamesCol.createIndex({ Year: 1, JP_Sales: 1 });
    await gamesCol.createIndex({ Year: 1, Other_Sales: 1 });
    //used by getDistinctByType and getYearlyGameCountByType
    await gamesCol.createIndex({ Genre: 1 });
    await gamesCol.createIndex({ Platform: 1 });

    //INDEXES FOR TRENDS
    await trendsCol.createIndex({ year: 1 });
    await trendsCol.createIndex({ region: 1 });
    await trendsCol.createIndex({ country_code: 1 });
    //used by countriesFromTrends
    await trendsCol.createIndex({ region: 1, year: 1 });
    //used by getCategoriesByYearAndCountry
    await trendsCol.createIndex({ year: 1, country_code: 1 });
    //used by getTopTrendsByYearAndCategory
    await trendsCol.createIndex({ year: 1, country_code: 1, category_en: 1 });

    console.log('indexes created successfully');
  
  } catch (e) {
    if (process.env.NODE_ENV === 'test') {
      console.error('could not seed -test');
    } else {
      console.error('could not seed');
      console.dir(e);
    }
  
  } finally {
    //clean up at the end
    if (db) {
      db.close();
    }
  }
}
// runSeed();