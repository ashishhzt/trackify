import mongoose from 'mongoose';
import sinon    from 'sinon';
import request  from 'supertest';
import {expect} from 'chai';
import app      from '../../server';
import Jobs      from './jobs.model';

const dbURI   = 'mongodb://localhost:27017/testingDB';
const clearDB = require('mocha-mongoose')(dbURI);

const testJobs = { 
  name: 'joe'
}

const createJobs = () => Jobs.create(testJobs);

describe('Jobs model', () => {

  beforeEach('Establish DB connection', (done) => {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', (done) => clearDB(done));  

  it('should exist', () => {
    expect(Jobs).to.be.a('function');
  });

  describe('Creation', (done) => {

    afterEach('Clear test database', done => clearDB(done));

    it('should exist', (done) => {
      createJobs()
        .then( jobs => {
          expect(jobs.name).to.equal('joe');
          done();
        })
    });
  });
});

describe('Jobs Router', () => {

  beforeEach('Establish DB connection', (done) => {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', done => clearDB(done));

  describe('Should be REST-ful', () => {

    let agent;
    let newJobsId;

    beforeEach('Create guest agent', (done) => {
      agent = request.agent(app);
      createJobs().then((jobs) => {
        newJobsId = jobs._id
        done()
      });
    });

    afterEach('Clear test database', done => clearDB(done));

    it('Should get all', (done) => {
      agent
        .get('/api/jobs')
        .expect(200)
        .expect(res => {
          if(res.body[0].name !== 'joe') throw new Error('not found')
        })
        .end(done);
    });

    it('Should create', (done) => {
      agent
        .post(`/api/jobs/`)
        .send({name: 'david'})
        .expect(200)
        .expect(res => {
          if(res.body.name !== 'david') throw new Error('not found')
        })
        .end(done);
    });

    it('Should get one', (done) => {
      agent
        .get('/api/jobs/' + newJobsId)
        .expect(200)
        .expect(res => {
          if(res.body.name !== 'joe') throw new Error('not found')
        })
        .end(done);
    });

    it('Should update', (done) => {
      agent
        .put('/api/jobs/' + newJobsId)
        .send({name: 'david'})
        .expect(200)
        .expect(res => {
          if(res.body.name !== 'david') throw new Error('not found')
        })
        .end(done);
    });

    it('Should delete', (done) => {
      agent
        .delete('/api/jobs/' + newJobsId)
        .expect(200)
        .expect(res => {
          console.log()
          if(res.body.name !== 'joe') throw new Error('not found')
        })
        .expect(()=>{
          return Jobs.find({})
            .then(jobs => {
              if(jobs.length) throw new Error('did not delete')
            });
        })
        .end(done);
    });

  });
});