'use strict';

var fs = require('fs-extra');
var async = require('async');
var shortid = require('shortid');

const EventEmitter = require('events').EventEmitter;
const util = require('util');

var GenerateEvents = {
  EXECUTE : "generate",
  SUCCESS : "generate:done",
  ERROR   : "generate:error"
};

var OperationHooks = {
  AFTER_SAVE : "save.after",
  AFTER_DELETE : "delete.after"
}

function ConfigGenerator(Model, bootOptions) {
  EventEmitter.call(this)

  this.id = shortid.generate();
  this.model = Model;
  this.options = Object.assign({
    name: Model.modelName,
    list: true,
    savePath: ".",
    dependencies: []
  }, bootOptions);
}

util.inherits(ConfigGenerator, EventEmitter)

ConfigGenerator.prototype.registerChangeEvents = function() {
  
  this.model.observe('after save', (ctx, next) => {
    next();

    //Process on background
    this.model.emit("generate", OperationHooks.AFTER_SAVE, ctx);
  });

  this.model.observe('after delete', (ctx, next) => {
    next();

    //Process on background
    this.model.emit("generate", OperationHooks.AFTER_DELETE, ctx);
  });

  this.model.on(GenerateEvents.EXECUTE, (event, ctx) => {
    console.log("ConfigGenerator:%s: Event %s model %s:%s", this.id
        , GenerateEvents.EXECUTE, this.options.name, event);
    this.generateModel(this.model, this.options, true);
  });

}

ConfigGenerator.prototype.generateModel = function(model, options, buildDeps) {
  var queryFunc = options.list ? model.find : model.findOne;
  queryFunc.call(model).then((result) => {
    var models = model.app.models;
    if(buildDeps) {
      this.generateDeps(models, options, result);
    } else {
      this.dumpConfig(result, {}, options);
    }
  }).catch((err) => {
    this.emit(GenerateEvents.ERROR, err, options.name);
  });
}

ConfigGenerator.prototype.generateDeps = function(models, options, data) {
  var depList = {};

  async.each(options.dependencies, (deps, callback) => {
      this.createDependencies(models, deps, depList, callback);
    }, (err, name) => {
      if(err) {
        this.emit(GenerateEvents.ERROR, err, name);
      } else {
        this.dumpConfig(data, depList, options);
      }
    });
}

ConfigGenerator.prototype.createDependencies = function(models, deps, depList, callback) {
  var depSettings = Object.assign({
      model: deps,
      generate: false
    }, deps);
  
  var depModel = models[depSettings.model];
  if(depModel) {
    if(depSettings.generate) {
      var depOptions = Object.assign({
          name: depModel.modelName,
          list: true,
          savePath: ".",
          dependencies: []
        }, depModel.settings.mixins.ConfigGenerator);
      this.generateModel(depModel, depOptions, false);
      callback();
    } else {
      var depOptions = Object.assign({
        name: depModel.modelName,
        list: true
      }, depModel.settings.mixins.ConfigGenerator);
      this.buildDependencies(depModel, depOptions, depList, callback);
    }
  }
}

ConfigGenerator.prototype.buildDependencies = function(model, options, depList, callback) {
  var queryFunc = options.list ? model.find : model.findOne;
  queryFunc.call(model).then((result) => {
    depList = Object.assign(depList, {[options.name] : result});
    callback();
  }).catch((err) => {
    callback(err, options.name);
  });
}

ConfigGenerator.prototype.dumpConfig = function(data, depList, options) {
  var output = {
      [options.name]: data,
      depList: depList
    };

  var configDump = options.savePath + "/" + options.name + ".json";
  fs.writeFile(configDump, JSON.stringify(output, null, 4), (err) => {
      if(err) {
        this.emit(GenerateEvents.ERROR, err, options.name);
      } else {
        this.emit(GenerateEvents.SUCCESS, options.name);
      }
    });
}

module.exports = function(Model, bootOptions) {
  var configGenerator = new ConfigGenerator(Model, bootOptions);

  configGenerator.on(GenerateEvents.SUCCESS, (name) => {
    console.log("ConfigGenerator:%s: Event %s model %s", configGenerator.id
      , GenerateEvents.SUCCESS, name);
  });

  configGenerator.on(GenerateEvents.ERROR, (err, name) => {
    console.error("ConfigGenerator:%s: Event %s model %s error: %s", configGenerator.id
      , GenerateEvents.ERROR, name, err);
  });

  configGenerator.registerChangeEvents();
}; 