/* eslint-disable camelcase */
/* eslint-disable no-undef */
import request from 'supertest';
import * as chai from 'chai';
const expect = chai.expect;
import sinon from 'sinon';
import  app  from '../app.js';
import { db } from '../db/db.js';


/**
 * Unit tests for View 2 Endpoint for fetching a list of
 * Google trends queries given a year, country and category.
 * @author Jennifer
 */
describe('GET /api/trends/region/:year/country/:country/category/:category', () => {

  // Stub for Google Trends query_en
  let queriesStub;
  
  beforeEach(() => {
    // Stub connection to MongoDB
    sinon.stub(db, 'connect').resolves();
    queriesStub = sinon.stub(db, 'getTopTrendsByYearAndCategory');
  });
  
  afterEach(() => {
    sinon.restore();
  });


  // 200 OK
  it('200 - returns json of Google trends queries_en', async () => {
    
    // Mock DB output: queries from
    // the category_en "Searches" in US, year 2016
    queriesStub.resolves([
      { query_en: 'Powerball', country_code: 'GLOBAL', rank: 1 },
      { query_en: 'Prince', country_code: 'GLOBAL', rank: 2 },
      { query_en: 'Hurricane Matthew', country_code: 'GLOBAL', rank: 3 },
      { query_en: 'Pokémon Go', country_code: 'GLOBAL', rank: 4 },
      { query_en: 'Slither.io', country_code: 'GLOBAL', rank: 5 }
    ]);
    
    // Call endpoint
    const res = await request(app).get('/api/trends/region/2016/country/GLOBAL/category/Searches');

    // Check the body of the response
    expect(res.status).to.equal(200);

    const data = res.body;
    expect(Array.isArray(data)).to.equal(true);
    expect(data.length).to.equal(5);

    // Check the first query element
    expect(data[0].year).to.equal(2016);
    expect(data[0].name).to.equal('Powerball');
    expect(data[0].country).to.equal('GLOBAL');
    expect(data[0].rank).to.equal(1);
  });


  // 400 Error - Year is NaN
  it('400 - invalid year', async () => {

    // Call endpoint with invalid year
    const res = await request(app).get('/api/trends/region/Z0lP/country/GLOBAL/category/Searches');

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Year must be a number');
  });


  // 500 Error - Server error
  it('500 - server error, non-existent category', async () => {

    // Call endpoint with invalid category
    const res = await request(app).get('/api/trends/region/2016/country/GLOBAL/category/asdfgkl');

    expect(res.status).to.equal(500);
    expect(res.body).to.have.property('error', 'Server error');
  });
});