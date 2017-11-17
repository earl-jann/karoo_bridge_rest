"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var RedisAgentGenerator = function() {
  this.name = "redis_client.cfg";
}

RedisAgentGenerator.prototype.generate = function(config, path) {
  var configGenerator = new ConfigGenerator(this.name, this.includeName, this.includeFiles);
  configGenerator.generate(config, path, function(root, configWriter) {
    var redisAgents = root.addList("redis-agent");
    var redisAgent = redisAgents.addGroup();
    redisAgent.addBool("enabled").set(true);
    redisAgent.addString("host").set("127.0.0.1");
    redisAgent.addInt("port").set("%REDIS_PORT%");
    redisAgent.addString("password").set("DesertForbiddenFruit");
  });
}

module.exports = RedisAgentGenerator;