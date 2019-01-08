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
      reconnectTries: this._config.reconnectTries,
      useNewUrlParser: true
    }, config.options);

    this._emitter = mixinEmitter(this);

    mongoose.set('bufferCommands', false);
    mongoose.Promise = Promise;
    this._connection = mongoose.createConnection(this._config.uri, this._connectionOptions);
  }

  connect () {
    this._connection.on('connected', () => {
      this._logger.info('MongooseAdapter::connect() connected');
    });

    this._connection.on('disconnected', () => {
      this._logger.warn('MongooseAdapter::connect() disconnected');
      this._emitter.emit('disconnected');
    });

    return this._connection.startSession();
  }

  disconnect () {
    return new Promise((resolve, reject) => {
      this._connection.close(true, () => {
        delete this._connection;
        this._emitter.emit('closed');
        resolve();
      });
    });
  }

  connection () {
    return this._connection;
  }

  collection (name) {
    return this._connection.collection(name);
  }

  destroy () {
    this._emitter.removeAllListeners();
  }
}

module.exports = MongooseAdapter;
