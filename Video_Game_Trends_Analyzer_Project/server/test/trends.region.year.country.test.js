/* eslint-disable no-undef */
import request from 'supertest';
import * as chai from 'chai';
const expect = chai.expect;
import sinon from 'sinon';
import  app  from '../app.js';
import { db } from '../db/db.js';


/**
 * Unit tests for View 2 Endpoint for fetching a list of
 * Google trends categories given a specific year and country.
 * @author Jennifer
 */
describe('GET /api/trends/region/:year/country/:country', () => {
  let catgeoriesStub;
  
  beforeEach(() => {
    // Stub connection to MongoDB
    sinon.stub(db, 'connect').resolves();
    catgeoriesStub = sinon.stub(db, 'getCategoriesByYearAndCountry');
  });
  
  afterEach(() => {
    sinon.restore();
  });


  // 200 OK
  it('200 - returns list of Google trends categories_en', async () => {
    
    // Mock DB output: list of category_en
    catgeoriesStub.resolves(['Pokemon Go', 'Movie', 'Drama']);
    
    // Call endpoint
    const res = await request(app).get('/api/trends/region/2016/country/JP');

    // Check the body of the response
    expect(res.status).to.equal(200);
    expect(res.body.length).to.equal(3);
    expect(res.body[0]).to.equal('Pokemon Go');
    expect(res.body[1]).to.equal('Movie');
    expect(res.body[2]).to.equal('Drama');
  });


  // 400 Error - Year is NaN
  it('400 - invalid year', async () => {

    // Call endpoint with invalid year
    const res = await request(app).get('/api/trends/region/yearStr/country/JP');

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Year must be a number');
  });


  // 500 Error - Server error
  it('500 - server error, invalid country code', async () => {

    // Call endpoint with invalid country code
    const res = await request(app).get('/api/trends/region/2016/country/ASDF');

    expect(res.status).to.equal(500);
    expect(res.body).to.have.property('error', 'Server error');
  });
});