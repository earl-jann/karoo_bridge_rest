"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var HomerGenerator = function() {
  this.name = "homer.cfg";

  ConfigGenerator.call(this, this.name);
}

HomerGenerator.prototype = Object.create(ConfigGenerator.prototype);

HomerGenerator.prototype.validate = function(config) {
  return (config && config.homer);
}

HomerGenerator.prototype.writeRoot = function(config, root, configWriter) {
  root.addBool("homer-enabled").set(config.homer.homer_enabled);
  root.addInt("homer-version").set(config.homer.homer_version);
  root.addString("homer-host").set(config.homer.homer_host);
  root.addInt("homer-port").set(config.homer.homer_port);
  root.addString("homer-password").set(config.homer.homer_password);
  root.addBool("homer-compression").set(config.homer.homer_compression);
  root.addInt("homer-id").set(config.homer.homer_id);
}

module.exports = HomerGenerator;