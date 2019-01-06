'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const MongooseAdapter = require('../src/mongoose-adapter');

const noop = () => {};
const logger = {
  info: noop,
  warn: noop
};

describe('MongooseAdapter', function () {
  it('should be a function', function () {
    expect(MongooseAdapter).to.be.a('function');
  });

  describe('connect()', function () {
    before(function () {
      this.subject = new MongooseAdapter(logger, {uri: 'mongodb://localhost/mongoose-adapter-test'});
    });

    after(async function () {
      await this.subject.disconnect();
    });

    it('should connect', async function () {
      await this.subject.connect();
    });
  });

  describe('given a connection', function () {
    before(async function () {
      this.subject = new MongooseAdapter(logger, {uri: 'mongodb://localhost/mongoose-adapter-test'});
      await this.subject.connect();
      this._conn = this.subject.connection();
    });

    after(async function () {
      await this.subject.disconnect();
    });

    describe('mongoose insert and read', function () {
      before(async function () {
        await this._conn.collection('aaa').deleteMany({});
      });

      it('should insert', async function () {
        await this._conn.collection('aaa').insertOne({foo: 'bar'});
        await this._conn.collection('aaa').insertOne({bar: 'baz'});
        await this._conn.collection('aaa').updateOne({foo: 'bar'}, {$set: {foo: 'baz'}});
      });

      it('... waiting 100 ms', async function () {
        return new Promise((resolve) => setTimeout(resolve, 100));
      });

      it('should find', async function () {
        await this._conn.collection('aaa').removeOne({foo: 'baz'});
        const result = await this._conn.collection('aaa').findOne({bar: 'baz'});
        expect(result._id).to.match(/^[a-z0-9]{24}$/);
        expect(result.bar).to.equal('baz');
      });
    });
  });
});
