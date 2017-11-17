"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var PortsGenerator = function() {
  this.name = "ports.cfg";
}

PortsGenerator.prototype.generate = function(config, path) {
  var configGenerator = new ConfigGenerator(this.name);
  configGenerator.generate(config, path, function(root, configWriter) {
    root.addInt("sip-tcp-port-base").set(config.sip_ports.sip_tcp_port_base);
    root.addInt("sip-tcp-port-max").set(config.sip_ports.sip_tcp_port_max);
    root.addInt("rtp-proxy-port-base").set(config.sip_ports.rtp_proxy_port_base);
    root.addInt("rtp-proxy-port-max").set(config.sip_ports.rtp_proxy_port_max);
    root.addInt("transcoder-port-base").set(config.sip_ports.transcoder_port_base);
    root.addInt("transcoder-port-max").set(config.sip_ports.transcoder_port_max);
  });    
}

module.exports = PortsGenerator;