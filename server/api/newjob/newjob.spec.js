import mongoose from 'mongoose';
import sinon    from 'sinon';
import request  from 'supertest';
import {expect} from 'chai';
import app      from '../../server';
import Newjob      from './newjob.model';

const dbURI   = 'mongodb://localhost:27017/testingDB';
const clearDB = require('mocha-mongoose')(dbURI);

const testNewjob = { 
  name: 'joe'
}

const createNewjob = () => Newjob.create(testNewjob);

describe('Newjob model', () => {

  beforeEach('Establish DB connection', (done) => {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', (done) => clearDB(done));  

  it('should exist', () => {
    expect(Newjob).to.be.a('function');
  });

  describe('Creation', (done) => {

    afterEach('Clear test database', done => clearDB(done));

    it('should exist', (done) => {
      createNewjob()
        .then( newjob => {
          expect(newjob.name).to.equal('joe');
          done();
        })
    });
  });
});

describe('Newjob Router', () => {

  beforeEach('Establish DB connection', (done) => {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', done => clearDB(done));

  describe('Should be REST-ful', () => {

    let agent;
    let newNewjobId;

    beforeEach('Create guest agent', (done) => {
      agent = request.agent(app);
      createNewjob().then((newjob) => {
        newNewjobId = newjob._id
        done()
      });
    });

    afterEach('Clear test database', done => clearDB(done));

    it('Should get all', (done) => {
      agent
        .get('/api/newjob')
        .expect(200)
        .expect(res => {
          if(res.body[0].name !== 'joe') throw new Error('not found')
        })
        .end(done);
    });

    it('Should create', (done) => {
      agent
        .post(`/api/newjob/`)
        .send({name: 'david'})
        .expect(200)
        .expect(res => {
          if(res.body.name !== 'david') throw new Error('not found')
        })
        .end(done);
    });

    it('Should get one', (done) => {
      agent
        .get('/api/newjob/' + newNewjobId)
        .expect(200)
        .expect(res => {
          if(res.body.name !== 'joe') throw new Error('not found')
        })
        .end(done);
    });

    it('Should update', (done) => {
      agent
        .put('/api/newjob/' + newNewjobId)
        .send({name: 'david'})
        .expect(200)
        .expect(res => {
          if(res.body.name !== 'david') throw new Error('not found')
        })
        .end(done);
    });

    it('Should delete', (done) => {
      agent
        .delete('/api/newjob/' + newNewjobId)
        .expect(200)
        .expect(res => {
          console.log()
          if(res.body.name !== 'joe') throw new Error('not found')
        })
        .expect(()=>{
          return Newjob.find({})
            .then(newjob => {
              if(newjob.length) throw new Error('did not delete')
            });
        })
        .end(done);
    });

  });
});