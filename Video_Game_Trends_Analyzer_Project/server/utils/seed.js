import {db} from '../db/db.js';
import fs from 'node:fs/promises';

// QUESTION: add json data to the repo?
process.loadEnvFile();
const vgFilepath = process.env.VG_DATA_PATH;
const trendsFilepath = process.env.TRENDS_DATA_PATH;


try {
  await db.connect('webDevProjectDevelopment');
  
  // Load the 2 json files
  const rawVGSales = await fs.readFile(vgFilepath, 'utf8');
  const vgsalesData = JSON.parse(rawVGSales);
  const rawGoogTrends = await fs.readFile(trendsFilepath, 'utf8');
  const trendsData = JSON.parse(rawGoogTrends);
  
  // Insert in Video Game collection
  await db.setCollection('video_game_sales'); // CAUTION: collection name could be different
  const vgSalesNum = await db.createMany(vgsalesData);
  console.log(`Inserted ${vgSalesNum} video games sales entries.`);
  
  // Insert in Google Trends collection
  await db.setCollection('google_trends_queries'); // CAUTION: collection name could be different
  const trendsNum = await db.createMany(trendsData);
  console.log(`Inserted ${trendsNum} Google query data.`);
 
} catch (e) {
  console.error('could not seed');
  console.dir(e);
 
} finally {
  //clean up at the end
  if (db) {
    db.close();
  }
  process.exit();
}