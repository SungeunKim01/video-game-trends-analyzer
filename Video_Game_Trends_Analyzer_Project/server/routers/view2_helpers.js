import { db } from '../db/db.js';

// I refer this mongodb comparison operators website:
//https://www.mongodb.com/docs/manual/reference/mql/query-predicates/comparison/
// also refer this mongodb Aggregation operations website:
//https://www.mongodb.com/docs/manual/aggregation/

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

/**
 * @returns a list of countries for the chosen region
 * this try to return only countries that appear in the given year, and then
 * if none found for that year, fall back to all years
 * always exclude Global since it’s not country
 * and for OTHER, exclude NA, EU , JP, Global and combine the rest
 */
export async function countriesFromTrends(regionKey, year) {
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
    if (sameYear != null) {
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

}
