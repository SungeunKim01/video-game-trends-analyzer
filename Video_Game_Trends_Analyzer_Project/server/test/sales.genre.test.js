/* eslint-disable camelcase */
import request from 'supertest';
import * as chai from 'chai';
const expect = chai.expect;
import sinon from 'sinon';
import  app  from '../app.js';
import { db } from '../db/db.js';

describe('GET /sales/genre/:genre', () => {
  let genreStub;
  let totalStub;
  let distinctGenreStub;

  beforeEach(() => {
    // Stub connection to MongoDB
    sinon.stub(db, 'connect').resolves();
    genreStub = sinon.stub(db, 'getYearlyGameCountByGenre');
    totalStub = sinon.stub(db, 'getTotalGamesPerYear');
    distinctGenreStub = sinon.stub(db, 'getDistinctGenres');
  });

  afterEach(() => {
    sinon.restore();
  });

  // 200 OK
  it('returns yearly game counts with total games and percent', async () => {
    // Mock the data
    genreStub.resolves([
      { year: 2005, num_games: 10 },
      { year: 2006, num_games: 15 }
    ]);
    totalStub.resolves([
      { year: 2005, total_games: 120 },
      { year: 2006, total_games: 150 }
    ]);
    distinctGenreStub.resolves(['Sports', 'Action']);

    // Call endpoint
    const result = await request(app).get(`/api/sales/genre/Sports`);

    expect(result.status).to.equal(200);
    expect(result.body).to.have.length(2);

    // Year 2005
    expect(result.body[0]).to.have.keys(['year', 'num_games', 'total_games', 'percent']);
    expect(result.body[0].year).to.equal(2005);
    expect(result.body[0].num_games).to.equal(10);
    expect(result.body[0].total_games).to.equal(120);
    expect(result.body[0].percent).to.be.closeTo(10 / 120 * 100, 0.01);

    // Year 2006
    expect(result.body[1].year).to.equal(2006);
    expect(result.body[1].num_games).to.equal(15);
    expect(result.body[1].total_games).to.equal(150);
    expect(result.body[1].percent).to.be.closeTo(15 / 150 * 100, 0.01);
  });


  // 400 Error  
  it('returns error when genre does not exist', async () => {
    distinctGenreStub.resolves(['Sports', 'Action']);

    // Call endpoint with invalid genre
    const res = await request(app).get('/api/sales/genre/RPG');

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Genre does not exist');
  });
});