/* eslint-disable camelcase */
import request from 'supertest';
import * as chai from 'chai';
const expect = chai.expect;
import sinon from 'sinon';
import  app  from '../app.js';
import { db } from '../db/db.js';

/**
 * 2 unittest GET /sales/region/:region/:year
 *supertest to hit the Express app w/o starting real server
 * sinon to stub db.findTopGamesByRegionYear so it does not touch mongodb
 * assert on http status and response body values
 * I refer Express and Unit Testing lecture slides and mocha cahi exercise to write these unit tests
*/
describe('GET /api/sales/global/:year', () => {
  let stubs = [];

  beforeEach(() => {
    // Stub connection to MongoDB
    stubs.push(sinon.stub(db, 'connect').resolves());
  });

  //clean all stubs after each test
  afterEach(() => {
    stubs.forEach(s => s.restore());
    stubs = [];
  });

  /**
   *when given year 2010, the route should
   * return ttp 200,
   * echo back year 2010,
  */
  it('200 - returns array of {year, name, global_sales}', async () => {
    //stub db helper
    stubs.push(
      sinon.stub(db, 'findTopGamesByYear').resolves([
        { name: 'Kinect Adventures!', sales: 21.82 },
        { name: 'Pokemon Black/Pokemon White', sales: 15.32 }
      ])
    );

    // call route with valid params
    const res = await request(app).get('/api/sales/global/2010');

    //status
    expect(res.status).to.equal(200);

    //data mapping
    const data = res.body;
    expect(Array.isArray(data)).to.equal(true);
    expect(data.length).to.equal(2);

    expect(data[0].name).to.equal('Kinect Adventures!');
    expect(data[0].global_sales).to.equal(21.82);
    expect(data[0].year).to.equal(2010);

    expect(data[1].name).to.equal('Pokemon Black/Pokemon White');
    expect(data[1].global_sales).to.equal(15.32);
    expect(data[1].year).to.equal(2010);
  });


  //if year is not a number, the route should return tttp 400 and error msg
  it('400- invalid year returns error & not touch db hleper', async () => {
    // spy to ensure it is not called
    const spy = sinon.spy(db, 'findTopGamesByYear');
    stubs.push(spy);

    // call the route with invalid year string, not num
    const res = await request(app).get('/api/sales/global/yearstr');

    //status and error
    expect(spy.callCount).to.equal(0);
    expect('error' in res.body).to.equal(true);
    //her, db helper should not be called on validation failure
    expect(spy.callCount).to.equal(0);
  });
});
