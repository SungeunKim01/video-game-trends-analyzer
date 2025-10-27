import {db} from '../db/db.js';
import fs from 'node:fs/promises';

process.loadEnvFile();
const vgFilepath = '../data/vgsales.json';
const trendsFilepath = '../data/trends.json';


try {
  await db.connect(process.env.PROD_DB);
  
  // Load the 2 json files
  const rawVGSales = await fs.readFile(vgFilepath, 'utf8');
  const vgsalesData = JSON.parse(rawVGSales);
  const rawGoogTrends = await fs.readFile(trendsFilepath, 'utf8');
  const trendsData = JSON.parse(rawGoogTrends);
  
  // Insert in Video Game collection
  await db.setCollection('video_game_sales');
  const vgSalesNum = await db.createMany(vgsalesData);
  console.log(`Inserted ${vgSalesNum} video games sales entries.`);
  
  // Insert in Google Trends collection
  await db.setCollection('google_trends_queries');
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