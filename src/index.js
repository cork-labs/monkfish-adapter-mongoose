const mongoose = require('mongoose');

const mixinEmitter = require('@cork-labs/mixin-emitter');

class Mongo {
  constructor (logger, config) {
    this._logger = logger;
    this._config = Object.assign({}, config);
    this._connectionOptions = Object.assign({
      keepAlive: true,
      reconnectTries: Number.MAX_VALUE
    }, config.options);

    this._emitter = mixinEmitter(this);
    mongoose.Promise = Promise;
    this._connection = mongoose.createConnection(this._config.uri, this._connectionOptions);
  }

  connect () {
    mongoose.connection.on('connected', () => {
      this._logger.info('Mongo::connect() connected');
    });

    mongoose.connection.on('disconnected', () => {
      this._logger.warn('Mongo::connect() disconnected');
      this._emitter.emit('disconnected');
    });
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

module.exports = Mongo;
