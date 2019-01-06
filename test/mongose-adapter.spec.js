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

  describe('given a connection and a model', function () {
    before(async function () {
      this.subject = new MongooseAdapter(logger, {uri: 'mongodb://localhost/mongoose-adapter-test'});
      await this.subject.connect();
      this._conn = this.subject.connection();
      const mongoose = this.subject.connection();
      this._model = mongoose.model('aaa', new mongoose.base.Schema({foo: 'string'}));
      await this._model.deleteMany({});
    });

    after(async function () {
      await this.subject.disconnect();
    });

    describe('mongoose insert and read', function () {
      it('should insert', async function () {
        await this._model.create({foo: 'bar'});
        await this._model.updateOne({foo: 'bar'}, {$set: {foo: 'baz'}});
        await this._model.deleteOne({foo: 'baz'});
        await this._model.create({foo: 'qux'});
      });

      it('should find', async function () {
        const result = await this._model.findOne({foo: 'qux'});
        expect(result._id).to.match(/^[a-z0-9]{24}$/);
        expect(result.foo).to.equal('qux');
      });
    });
  });
});
