import request from 'supertest';
import * as chai from 'chai';
const expect = chai.expect;
import sinon from 'sinon';
import app from '../app.js';
import { db } from '../db/db.js';
// import { trendsApi } from '../routers/view2_helpers.js';

/**
 * unit test for GET /api/sales/region/:region/:year
 *
 *supertest to hit the Express app w/o starting real server
 * sinon to stub db.findTopGamesByRegionYear so it does not touch mongodb
 * assert on http status and response body values

 * db.findTopGamesAllRegionsByYear - aggregation result for vgsales
 * trendsApi.countriesFromTrends- country list from Trends
 * I refer Express and Unit Testing lecture slides and mocha cahi exercise to write these unit tests
 */
describe('GET /api/sales/region/:region/:year', () => {
  let stubs = [];

  //clean all stubs after each test
  afterEach(() => {
    stubs.forEach(s => s.restore());
    stubs = [];
  });

  // pretend this mongo aggregation returned top5 for NA/2006
  // but the real route only needs names, totals are ignored
  it('200 - returns {region, year, countries, data[]} with only game names', async () => {
    stubs.push(
      sinon.stub(db, 'findTopGamesAllRegionsByYear').resolves([
        { _id: 'Wii Sports', total: 41.49 },
        { _id: 'New Super Mario Bros.', total: 11.38 },
        { _id: 'Wii Play', total: 14.03 },
        { _id: 'The Legend of Zelda: Twilight Princess', total: 3.83 },
        { _id: 'Gears of War', total: 3.54 }
      ])
    );

    //stub the country list provider using trendsApi wrapper obj
    stubs.push(
      sinon.stub(db, 'countriesFromTrends').resolves(['Canada', 'Mexico', 'United States'])
    );

    // call route with valid params
    const res = await request(app).get('/api/sales/region/NA/2006');

    //assert 

    expect(res.status).to.equal(200);
    expect(res.body.region).to.equal('NA');
    expect(res.body.year).to.equal(2006);

    const countries = res.body.countries;
    expect(Array.isArray(countries)).to.equal(true);
    expect(res.body.countries).to.deep.equal(['Canada', 'Mexico', 'United States']);

    //data should include only names
    const data = res.body.data;
    expect(Array.isArray(res.body.data)).to.equal(true);
    expect(res.body.data.length).to.equal(5);

    //data
    expect(data[0].name).to.equal('Wii Sports');
    expect(data[1].name).to.equal('New Super Mario Bros.');
    expect(data[2].name).to.equal('Wii Play');
    expect(data[3].name).to.equal('The Legend of Zelda: Twilight Princess');
    expect(data[4].name).to.equal('Gears of War');
  });

  //if year is not a number, the route should return tttp 400 and error msg
  it('400 - invalid year returns error & db method is not called', async () => {
    // spy to ensure it is not called
    const spy = sinon.spy(db, 'findTopGamesAllRegionsByYear');
    stubs.push(spy);

    // call the route with invalid year string, not num
    const res = await request(app).get('/api/sales/region/EU/yearstr');

    //status and error
    expect(spy.callCount).to.equal(0);
    expect('error' in res.body).to.equal(true);
    //her, db helper should not be called on validation failure
    expect(spy.callCount).to.equal(0);
  });
});
