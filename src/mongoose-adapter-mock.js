'use strict';

const MemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const MongooseAdapter = require('./mongoose-adapter');

const noop = () => {};

class MongooseAdapterMock {
  constructor (logger, config = {}) {
    this._config = config;
  }

  connect () {
    this._server = new MemoryServer();

    return this._server.getConnectionString().then((mongoUri) => {
      const logger = {
        info: noop,
        warn: noop
      };
      const config = Object.assign(this._config, {
        uri: mongoUri
      });
      this._adapter = new MongooseAdapter(logger, config);
      return this._adapter.connect();
    });
  }

  disconnect () {
    if (this._server) {
      this._server.stop();
    }
    if (this._adapter) {
      return this._adapter.disconnect();
    } else {
      return Promise.resolve();
    }
  }

  connection () {
    if (this._adapter) {
      return this._adapter.connection();
    } else {
      return Promise.resolve();
    }
  }

  collection (name) {
    return this._adapter.collection(name);
  }

  destroy () {
    this._adapter.destroy();
  }
}

module.exports = MongooseAdapterMock;
