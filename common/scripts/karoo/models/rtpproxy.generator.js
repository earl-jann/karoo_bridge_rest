"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

/*
 * Class RTPProxyGenerator 
 */

var RTPProxyGenerator = function() {
  this.name = "rtp_proxy.cfg";

  ConfigGenerator.call(this, this.name);
}

RTPProxyGenerator.prototype = Object.create(ConfigGenerator.prototype);

RTPProxyGenerator.prototype.validate = function(config) {
  return (config && config.rtp_proxy);
}

RTPProxyGenerator.prototype.writeRoot = function(config, root, configWriter) {
  root.addInt("rtp-proxy-read-timeout").set(config.rtp_proxy.rtp_proxy_read_timeout);
  root.addInt("rtp-proxy-transport-thread-count").set(config.rtp_proxy.rtp_proxy_transport_thread_count);
};

module.exports = RTPProxyGenerator;