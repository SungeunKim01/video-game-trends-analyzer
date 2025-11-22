/* eslint-disable camelcase */

import request from 'supertest';
import * as chai from 'chai';
const expect = chai.expect;
import sinon from 'sinon';
import app from '../app.js';
import { db } from '../db/db.js';
import { salesCache } from '../routers/sales.js';

/**
 * Unit tests for View3 endpoint - GET /api/sales/platform/:value
 *
 * this verifies
 * 200:computes {year, num_games, total_games, percent} for a valid platform
 * 400: rejects unknown platform values
 * 00: surfaces server errors from database helpers
 *
 * this use supertest against the real Express app,
 * stub db methods (getDistinctByType, getYearlyGameCountByType, getTotalGamesPerYear)
 * @author Sungeun
 */
describe('View3 GET /api/sales/platform/:value', () => {
  let stubs = [];

  beforeEach(() => {
    //clear cache before test runs
    salesCache.clear();
    stubs.push(sinon.stub(db, 'connect').resolves());
    // mute route err logs during tests that expect 500
    stubs.push(sinon.stub(console, 'error').callsFake(() => {}));
  });
  
  afterEach(() => {
    stubs.forEach(s => s.restore());
    stubs = [];
  });

  // give 200 OK when correct math for a valid platform
  it('200 - computes percentages for Wii', async () => {
    stubs.push(sinon.stub(db, 'getDistinctByType').resolves(['DS', 'Wii']));
    stubs.push(sinon.stub(db, 'getYearlyGameCountByType').resolves([
      { year: 2006, num_games: 4 },
      { year: 2007, num_games: 6 },
    ]));
    stubs.push(sinon.stub(db, 'getTotalGamesPerYear').resolves([
      { year: 2006, total_games: 40 },
      { year: 2007, total_games: 60 },
    ]));

    const res = await request(app).get('/api/sales/platform/Wii');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      { year: 2006, num_games: 4, total_games: 40, percent: 10.00 },
      { year: 2007, num_games: 6, total_games: 60, percent: 10.00 },
    ]);
  });

  //give 400 Bad Request when unknown platfrom value
  it('400 - unknown platform value', async () => {
    stubs.push(sinon.stub(db, 'getDistinctByType').resolves(['Wii', 'PS3']));
    const res = await request(app).get('/api/sales/platform/GameSphere');
    expect(res.status).to.equal(400);
    expect(res.body.error).to.match(/does not exist/i);
  });

  it('500 - db throws while fetching totals', async () => {
    stubs.push(sinon.stub(db, 'getDistinctByType').resolves(['Wii']));
    stubs.push(sinon.stub(db, 'getYearlyGameCountByType').resolves([{ year: 2010, num_games: 2 }]));
    stubs.push(sinon.stub(db, 'getTotalGamesPerYear').rejects(new Error('error')));

    const res = await request(app).get('/api/sales/platform/Wii');
    expect(res.status).to.equal(500);
  });
});
