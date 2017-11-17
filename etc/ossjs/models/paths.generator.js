"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var PathsGenerator = function() {
  this.name = "paths.cfg";
}

PathsGenerator.prototype.generate = function(config, path) {
  var configGenerator = new ConfigGenerator(this.name);
  configGenerator.generate(config, path, function(root, configWriter) {
    var paths = root.addGroup("paths");
    paths.addString("dialog-state-dir").set("%KAROO_CONFIG_DIRECTORY%/states/dialog-state");
    paths.addString("registration-records-dir").set("%KAROO_CONFIG_DIRECTORY%/states/reg-records");
    paths.addString("rtp-state-dir").set("%KAROO_CONFIG_DIRECTORY%/states/rtp-state");
  });  
}

module.exports = PathsGenerator;