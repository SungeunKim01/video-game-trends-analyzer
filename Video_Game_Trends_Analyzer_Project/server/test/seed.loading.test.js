// stub fs.readFile, and stub db.* so there is no mongodb connection

import * as chai from 'chai';
const expect = chai.expect;
import sinon from 'sinon';
import fs from 'node:fs/promises';
import * as dbModule from '../db/db.js';
// prevent seed from process.exit() during test
process.env.NODE_ENV = 'test';
//import function that runs og seeding logic
import { runSeed } from '../utils/seed.js';

describe('seed.js loading module (fs/promises mocked)', () => {
  let stubs = [];

  afterEach(() => { 
    stubs.forEach(s => s.restore()); stubs = []; 
  });

  /**
   * T1 -success path
   *mock fs.readFile to return valid json arrays for both files
   * stub db.connect, setCollection, createMany, close
   * assert that createMany receives parsed arrays from fake str
   */
  it('reads 2 json files and inserts parsed arrays, remember-no disk, no dn', async () => {
    //fake file contents
    const fakeVGSales = '[{"Name":"Call of Duty: Black Ops","Year":2010,"NA_Sales":5.98}]';
    // const fakeTrends = '[{"location":"Global","year":2001,"query_en":"Counterstrike"}]';

    ///stub fs.readFile to return fake json
    const readFileStub = sinon.stub(fs, 'readFile').resolves(fakeVGSales);
    stubs.push(readFileStub);

    // stub db methods so mongodb nt used
    stubs.push(sinon.stub(dbModule.db, 'connect').resolves());
    stubs.push(sinon.stub(dbModule.db, 'setCollection').resolves());
    const createManyStub = sinon.stub(dbModule.db, 'createMany').resolves(1);
    stubs.push(createManyStub);
    stubs.push(sinon.stub(dbModule.db, 'close').resolves());

    await runSeed();

    //readFile
    expect(readFileStub.called).to.equal(true);
    //insert occurred here
    expect(createManyStub.called).to.equal(true);
    // verify 2ollections
    expect(createManyStub.callCount).to.equal(2);
  });

  /**
   *T2 – bad json so failure
   * error & skip db inserts
   */
  it('handle bad json & skips insert', async () => {
    //stub fs.readFile to return bad json
    const badReadFile = sinon.stub(fs, 'readFile').resolves('{{not good json');
    stubs.push(badReadFile);

    // stub db methods so mongodb nt used
    stubs.push(sinon.stub(dbModule.db, 'connect').resolves());
    const createManyStub = sinon.stub(dbModule.db, 'createMany').resolves(0);
    stubs.push(createManyStub);
    stubs.push(sinon.stub(dbModule.db, 'setCollection').resolves());
    stubs.push(sinon.stub(dbModule.db, 'close').resolves());

    //stub console.error to confirm error
    const consoleErrStub = sinon.stub(console, 'error');
    stubs.push(consoleErrStub);

    await runSeed();

    // logged error
    expect(consoleErrStub.called).to.equal(true);
    //skipped inserts
    expect(createManyStub.callCount).to.equal(0);
  });
});