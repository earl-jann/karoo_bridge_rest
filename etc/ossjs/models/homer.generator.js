"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var HomerGenerator = function() {
  this.name = "homer.cfg";
}

HomerGenerator.prototype.generate = function(config, path) {
  var configGenerator = new ConfigGenerator(this.name);
  configGenerator.generate(config, path, function(root, configWriter) {
    root.addBool("homer-enabled").set(config.homer.homer_enabled);
    root.addInt("homer-version").set(config.homer.homer_version);
    root.addString("homer-host").set(config.homer.homer_host);
    root.addInt("homer-port").set(config.homer.homer_port);
    root.addString("homer-password").set(config.homer.homer_password);
    root.addBool("homer-compression").set(config.homer.homer_compression);
    root.addInt("homer-id").set(config.homer.homer_id);
  });
}

module.exports = HomerGenerator;