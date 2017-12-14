"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");
var fs = require("filesystem");
var common = require("./common.js");

/*
 * Class PathsGenerator 
 */

var PathsGenerator = function() {
  this.name = "paths.cfg";

  ConfigGenerator.call(this, this.name);
}

PathsGenerator.prototype = Object.create(ConfigGenerator.prototype);

PathsGenerator.prototype.validate = function(config) {
  /* We only generate paths.cfg if it's missing*/
  return !fs.exists(common.karooConfigPath + "/config/" + this.name);
}

PathsGenerator.prototype.writeRoot = function(config, root, configWriter) {
  var paths = root.addGroup("paths");
  paths.addString("dialog-state-dir").set("%KAROO_CONFIG_DIRECTORY%/states/dialog-state");
  paths.addString("registration-records-dir").set("%KAROO_CONFIG_DIRECTORY%/states/reg-records");
  paths.addString("rtp-state-dir").set("%KAROO_CONFIG_DIRECTORY%/states/rtp-state");
};

module.exports = PathsGenerator;