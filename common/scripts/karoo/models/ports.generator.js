"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

/*
 * Class PortsGenerator 
 */

var PortsGenerator = function() {
  this.name = "ports.cfg";

  ConfigGenerator.call(this, this.name);
}

PortsGenerator.prototype = Object.create(ConfigGenerator.prototype);

PortsGenerator.prototype.validate = function(config) {
  return (config && config.sip_ports);
}

PortsGenerator.prototype.writeRoot = function(config, root, configWriter) {
  root.addInt("sip-tcp-port-base").set(config.sip_ports.sip_tcp_port_base);
  root.addInt("sip-tcp-port-max").set(config.sip_ports.sip_tcp_port_max);
  root.addInt("rtp-proxy-port-base").set(config.sip_ports.rtp_proxy_port_base);
  root.addInt("rtp-proxy-port-max").set(config.sip_ports.rtp_proxy_port_max);
  root.addInt("transcoder-port-base").set(config.sip_ports.transcoder_port_base);
  root.addInt("transcoder-port-max").set(config.sip_ports.transcoder_port_max);
};

module.exports = PortsGenerator;