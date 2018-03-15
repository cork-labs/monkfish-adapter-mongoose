const mongoose = require('mongoose');

const mixinEmitter = require('@cork-labs/mixin-emitter');

const defaults = {
  reconnectTries: 3
};

class MongooseAdapter {
  constructor (logger, config) {
    this._logger = logger;
    this._config = Object.assign({}, defaults, config);
    this._connectionOptions = Object.assign({
      keepAlive: true,
      reconnectTries: this._config.reconnectTries
    }, config.options);

    this._emitter = mixinEmitter(this);

    mongoose.Promise = Promise;
    this._connection = mongoose.createConnection(this._config.uri, this._connectionOptions);
  }

  connect () {
    mongoose.connection.on('connected', () => {
      this._logger.info('MongooseAdapter::connect() connected');
    });

    mongoose.connection.on('disconnected', () => {
      this._logger.warn('MongooseAdapter::connect() disconnected');
      this._emitter.emit('disconnected');
    });

    return Promise.resolve();
  }

  disconnect () {
    return new Promise((resolve, reject) => {
      this._connection.close(() => {
        this._connection = null;
        this._emitter.emit('disconnected');
        resolve();
      });
    });
  }

  connection () {
    return this._connection;
  }
}

module.exports = MongooseAdapter;