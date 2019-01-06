'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const MongooseAdapterMock = require('../src/mongoose-adapter-mock');

describe('MongooseAdapterMock', function () {
  it('should be a function', function () {
    expect(MongooseAdapterMock).to.be.a('function');
  });

  describe('connect()', function () {
    before(function () {
      this.subject = new MongooseAdapterMock();
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
      this.subject = new MongooseAdapterMock();
      await this.subject.connect();
      this._conn = this.subject.connection();
    });

    after(async function () {
      await this.subject.disconnect();
    });

    describe('mongoose insert and read', function () {
      it('should insert', async function () {
        await this._conn.collection('aaa').insertOne({foo: 'bar'});
        await this._conn.collection('aaa').insertOne({bar: 'baz'});
        await this._conn.collection('aaa').updateOne({foo: 'bar'}, {$set: {foo: 'baz'}});
        await this._conn.collection('aaa').removeOne({foo: 'baz'});
      });

      it('should find', async function () {
        const result = await this._conn.collection('aaa').findOne({bar: 'baz'});

        expect(result._id).to.match(/^[a-z0-9]{24}$/);
        expect(result.bar).to.equal('baz');
      });
    });
  });
});
