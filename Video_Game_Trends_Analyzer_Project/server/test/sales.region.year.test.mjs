import request from 'supertest';
import * as chai from 'chai';
const expect = chai.expect;
import sinon from "sinon";
import  app  from '../app.js';
import { db } from "../db/db.js";

/**
 * 2 unittest GET /sales/region/:region/:year
 *supertest to hit the Express app w/o starting real server
 * sinon to stub db.findTopGamesByRegionYear so it does not touch mongodb
 * assert on http status and response body values
 * I refer Express and Unit Testing lecture slides and mocha cahi exercise to write these unit tests
*/
describe("GET /sales/region/:region/:year", () => {
  let stubs = [];

  //clean all stubs after each test
  afterEach(() => {
    stubs.forEach(s => s.restore());
    stubs = [];
  });

  /**
   *when given valid region "NA" and year 2010, the route should
   * return ttp 200,
   * echo back region "NA" and year 2010,
   * include the stubbed countries list for NA,
   *map the dn results [{ name, sales }] to [{ name, NA: rounded to 2 decimals }, ..]
  */
  it("200 - returns {region, year, countries, data[]} and maps sales to the region key", async () => {
    //stub db helper
    stubs.push(
      sinon.stub(db, "findTopGamesByRegionYear").resolves([
        { name: "Wii Sports", sales: 41.469 },
        { name: "New Super Mario Bros.", sales: 11.4 }
      ])
    );

    // call route with valid params
    const res = await request(app).get("/sales/region/NA/2010");

    //status
    expect(res.status).to.equal(200);
    expect(res.body.region).to.equal("NA");
    expect(res.body.year).to.equal(2010);

    // stubbed countries for NA
    // so router uses static mapping - ["United States","Canada","Mexico"]
    expect(Array.isArray(res.body.countries)).to.equal(true);
    const countries = res.body.countries;
    expect(countries.indexOf("United States") > -1).to.equal(true);
    expect(countries.indexOf("Canada") > -1).to.equal(true);

    //data mapping
    const data = res.body.data;
    expect(Array.isArray(data)).to.equal(true);
    expect(data.length).to.equal(2);
    expect(data[0].name).to.equal("Wii Sports");
    expect(data[0].NA).to.equal(41.47);
    expect(data[1].name).to.equal("New Super Mario Bros.");
    expect(data[1].NA).to.equal(11.4);
  });

});
