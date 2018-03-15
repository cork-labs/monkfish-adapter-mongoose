'use strict';

const _ = require('lodash');

class MongooseAdapterSeeder {
  constructor () {
    this._services = {};
    this._models = {};
    this._vars = {};
  }

  _parseValue (value, matches) {
    return matches.reduce((value, match) => {
      const varName = match.substring(2, match.length - 2).trim();
      return value.replace(match, this.get(varName));
    }, value);
  }

  _parseData (data) {
    let key;
    let matches;
    for (key in data) {
      if (typeof data[key] === 'object') {
        this._parseData(data[key]);
      } else if (typeof data[key] === 'string') {
        matches = data[key].match(/<%\s*([a-zA-Z0-9.-_]+)\s*%>/g);
        if (matches) {
          data[key] = this._parseValue(data[key], matches);
        }
      }
    }
  }

  _getService (name) {
    if (!this._services[name]) {
      throw new Error(`Unknown service ${name}.`);
    }
    return this._services[name];
  }

  _getModel (name) {
    if (!this._models[name]) {
      throw new Error(`Unknown model ${name}.`);
    }
    return this._models[name];
  }

  _seedService (serviceName, method, name, args) {
    args = _.cloneDeep(args);
    this._parseData(args);
    const service = this._getService(serviceName);
    return Promise.resolve()
      .then(() => {
        return service[method].apply(service, args);
      })
      .then((results) => {
        if (name) {
          this._vars[name] = results;
        }
      })
      .catch((err) => {
        throw new Error(`Failed to store "${name}" via service "${serviceName}::${method}". ${err}.`);
      });
  }

  _seedDocument (modelName, model, name, data) {
    return model.create(data)
      .then((results) => {
        if (name) {
          this._vars[name] = results;
        }
      })
      .catch((err) => {
        throw new Error(`Failed to store "${name}" in collection "${modelName}". ${err}.`);
      });
  }

  _seedModel (modelName, name, data) {
    data = _.cloneDeep(data);
    this._parseData(data);
    const model = this._getModel(modelName);
    return Promise.resolve()
      .then(() => {
        if (Array.isArray(data)) {
          return Promise.all(data.map((item, index) => {
            return this._seedDocument(modelName, model, name && `${name}.${index}`, item);
          }));
        } else {
          return this._seedDocument(modelName, model, name, data);
        }
      });
  }

  _seed (docs) {
    if (!docs.length) {
      return Promise.resolve();
    }
    const batch = docs.shift();
    return Promise.resolve()
      .then(() => {
        if (batch.model) {
          return this._seedModel(batch.model, batch.name, batch.data);
        } else {
          return this._seedService(batch.service, batch.method, batch.name, batch.args);
        }
      })
      .then(() => this._seed(docs));
  }

  addServices (services) {
    Object.assign(this._services, services);
  }

  addModels (models) {
    Object.assign(this._models, models);
  }

  seed (docs) {
    return this._seed(docs.slice(0));
  }

  setVars (vars) {
    Object.assign(this._vars, vars);
  }

  get (varName, defaultValue) {
    const value = _.get(this._vars, varName);
    if (typeof value !== 'undefined') {
      return value;
    }
    if (arguments.length < 2) {
      throw new Error(`Var "${varName}" is not defined`);
    }
    return defaultValue;
  }
}

module.exports = MongooseAdapterSeeder;
