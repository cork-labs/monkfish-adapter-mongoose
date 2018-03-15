'use strict';

const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

class MongooseAdapterMock {
  constructor (config) {
    this._config = config;
  }

  connect () {
    return mockgoose.prepareStorage()
      .then(() => {
        this._connection = mongoose.createConnection(this._config.uri);
      });
  }

  disconnect () {
    return mockgoose.helper.reset()
      .then(() => mongoose.disconnect())
      .then(() => {
        mockgoose.mongodHelper.mongoBin.childProcess.kill('SIGTERM'); // https://github.com/Mockgoose/Mockgoose/issues/71
      });
  }

  seed (model, data) {
    return model.remove().then(() => model.create(data));
  }

  connection () {
    return this._connection;
  }
}

module.exports = MongooseAdapterMock;
