import request from 'supertest';
import * as chai from 'chai';
const expect = chai.expect;
import sinon from 'sinon';
import app from '../app.js';
import { db } from '../db/db.js';

/**
 * Unit tests for View3 endpoint GET /api/sales/genre/:value
 *
 * this Verifies
 * 200: computes {year, num_games, total_games, percent} for valid genre
 * 400: rejects unknown genre values
 * 500:surfaces server errors from database helpers
 * 200Division by zero, so percent = 0 when total_games = 0
 *
 * this use supertest against the real Express app,
 * stub db methods (getDistinctByType, getYearlyGameCountByType, getTotalGamesPerYear)
 * @author Sungeun
 */
describe('View3 GET /api/sales/genre/:value', () => {
  let stubs = [];

  beforeEach(() => {
    stubs.push(sinon.stub(db, 'connect').resolves());
    // mute route err logs during tests that expect 500
    stubs.push(sinon.stub(console, 'error').callsFake(() => {}));
  });

  afterEach(() => {
    stubs.forEach(s => s.restore());
    stubs = [];
  });

  // give 200 OK when correct math for a valid genre
  it('200 - computes percentages for Action', async () => {
    stubs.push(sinon.stub(db, 'getDistinctByType').resolves(['Action', 'Sports']));
    stubs.push(sinon.stub(db, 'getYearlyGameCountByType').resolves([
      { year: 2001, num_games: 2 },
      { year: 2002, num_games: 5 },
    ]));
    stubs.push(sinon.stub(db, 'getTotalGamesPerYear').resolves([
      { year: 2001, total_games: 10 },
      { year: 2002, total_games: 20 },
    ]));

    const res = await request(app).get('/api/sales/genre/Action');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      { year: 2001, num_games: 2, total_games: 10, percent: 20.00 },
      { year: 2002, num_games: 5, total_games: 20, percent: 25.00 },
    ]);
  });

  //give 400 Bad Request when unknown genre value
  it('400 - unknown genre value', async () => {
    const spyDistinct = sinon.spy(async () => ['Action', 'Sports']);
    stubs.push(sinon.stub(db, 'getDistinctByType').callsFake(spyDistinct));

    const res = await request(app).get('/api/sales/genre/Unknown');
    expect(res.status).to.equal(400);
    expect(res.body.error).to.match(/does not exist/i);
    expect(spyDistinct.calledOnce).to.equal(true);
  });

  //give 500 Server Error when building rows fails
  it('500 - db throws while building rows', async () => {
    stubs.push(sinon.stub(db, 'getDistinctByType').resolves(['Action']));
    stubs.push(sinon.stub(db, 'getYearlyGameCountByType').rejects(new Error('notyear')));
    stubs.push(sinon.stub(db, 'getTotalGamesPerYear').resolves([]));

    const res = await request(app).get('/api/sales/genre/Action');
    expect(res.status).to.equal(500);
  });

  //give 200 OK that handle divide by zero
  it('200 - percent 0 when total_games is 0', async () => {
    stubs.push(sinon.stub(db, 'getDistinctByType').resolves(['Action']));
    stubs.push(sinon.stub(db, 'getYearlyGameCountByType').resolves([{ year: 1999, num_games: 3 }]));
    stubs.push(sinon.stub(db, 'getTotalGamesPerYear').resolves([{ year: 1999, total_games: 0 }]));

    const res = await request(app).get('/api/sales/genre/Action');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([
      { year: 1999, num_games: 3, total_games: 0, percent: 0.00 },
    ]);
  });
});
