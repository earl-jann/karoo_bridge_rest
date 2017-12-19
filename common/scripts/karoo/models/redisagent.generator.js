"use strict"

var console = require("console");
var common = require("./common.js");
var ConfigGenerator = require("./config.generator");
var fs = require("filesystem");

/*
 * Class RedisAgentGenerator 
 */

var RedisAgentGenerator = function() {
  this.name = "redis_client.cfg";

  ConfigGenerator.call(this, this.name);
}

RedisAgentGenerator.prototype = Object.create(ConfigGenerator.prototype);

RedisAgentGenerator.prototype.validate = function(config) {
  /* We only generate redis_client.cfg if it's missing*/
  return !fs.exists(common.karooConfigPath + "/config/" + this.name);
}

RedisAgentGenerator.prototype.writeRoot = function(config, root, configWriter) {
  var redisAgents = root.addList("redis-agent");
  var redisAgent = redisAgents.addGroup();
  redisAgent.addBool("enabled").set(true);
  redisAgent.addString("host").set("127.0.0.1");
  redisAgent.addInt("port").set("%REDIS_PORT%");
  redisAgent.addString("password").set("DesertForbiddenFruit");
};

module.exports = RedisAgentGenerator;