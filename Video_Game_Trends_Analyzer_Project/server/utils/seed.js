import {db} from '../db/db.js';
import fs from 'node:fs/promises';
import path from 'node:path';

process.loadEnvFile(path.resolve('.env'));

const vgFilepath = path.resolve('data', 'vgsales.json');
const trendsFilepath = path.resolve('data', 'trends.json');

// Wrap current seeding code in exported function runSeed() 
// so tests can call it after stubbing fs and db
export async function runSeed() {
  try {
    await db.connect(process.env.DEV_DB);
    
    // Load the 2 json files
    const rawVGSales = await fs.readFile(vgFilepath, 'utf8');
    const vgsalesData = JSON.parse(rawVGSales);
    const rawGoogTrends = await fs.readFile(trendsFilepath, 'utf8');
    const trendsData = JSON.parse(rawGoogTrends);
    
    // Insert in Video Game collection
    await db.setCollection(process.env.DEV_VG_COLLECTION);
    const vgSalesNum = await db.createMany(vgsalesData);
    console.log(`Inserted ${vgSalesNum} video games sales entries.`);
    
    // Insert in Google Trends collection
    await db.setCollection(process.env.DEV_TRENDS_COLLECTION);
    const trendsNum = await db.createMany(trendsData);
    console.log(`Inserted ${trendsNum} Google query data.`);
  
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