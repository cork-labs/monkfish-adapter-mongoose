'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const Mongo = require('../src/index');

describe('Mongo', function () {
  it('should be a function', function () {
    expect(Mongo).to.be.a('function');
  });

  describe('api', function () {
    beforeEach(function () {
      this.spy = sinon.spy();
    });

    it('should...', function () {
      expect(true).to.equal(true);
    });
  });
});
