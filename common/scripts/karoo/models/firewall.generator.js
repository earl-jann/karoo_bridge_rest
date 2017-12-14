'use strict'

var console = require("console");
var File = require("file").File;

var customFirewall = function(type, base, max) {
  var iptable = "$IPTABLES -A INPUT -p {type} -m {type}  --dport {port}  -m state --state NEW  -j ACCEPT";
  var port = "" + base;
  if(base < max) {
    port = port.concat(":" + max);
  }

  return iptable.replace(new RegExp("{type}", 'g'), type.toLowerCase())
                .replace("{port}", port);
}

var FirewallGenerator = function() {
  this.name = "firewall.cfg";
  this.template = ["return {enabled}",
    "reset_all",
    "check_tools",
    "load_modules",
    "ip_forward 0",
    "$IPTABLES -A INPUT   -m state --state ESTABLISHED,RELATED -j ACCEPT", 
    "$IPTABLES -A OUTPUT  -m state --state ESTABLISHED,RELATED,NEW -j ACCEPT",
    "$IPTABLES -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT",
    "$IPTABLES -A INPUT -i lo   -j ACCEPT",
    "$IPTABLES -A OUTPUT -o lo   -j ACCEPT",
    "$IPTABLES -A INPUT -p icmp  -m icmp  --icmp-type 3  -m state --state NEW  -j ACCEPT",
    "$IPTABLES -A INPUT -p icmp  -m icmp  --icmp-type 0/0   -m state --state NEW  -j ACCEPT",
    "$IPTABLES -A INPUT -p icmp  -m icmp  --icmp-type 11/0   -m state --state NEW  -j ACCEPT",
    "$IPTABLES -A INPUT -p icmp  -m icmp  --icmp-type 11/1   -m state --state NEW  -j ACCEPT",
    "$IPTABLES -I INPUT -p udp -j ACCEPT"
  ];
}

FirewallGenerator.prototype.writeSIPRules = function(config) {
  var rules = "";

  /*TODO: Set interface for each listener*/
  config.listeners.forEach(function(listener) {
    var iptable = "";
    if(listener.tcp_enabled) {
      iptable += customFirewall("tcp", listener.sip_port, listener.sip_port) + "\n";
    }
    if(listener.udp_enabled) {
      iptable += customFirewall("udp", listener.sip_port, listener.sip_port) + "\n";
    }
    if(listener.tls_enabled) {
      iptable += customFirewall("tcp", listener.tls_port, listener.tls_port) + "\n";
    }
    if(listener.ws_enabled) {
      iptable += customFirewall("tcp", listener.ws_port, listener.ws_port) + "\n";
    }
    if(listener.wss_enabled) {
      iptable += customFirewall("tcp", listener.wss_port, listener.wss_port) + "\n";
    }

    if(iptable) {
      rules = rules.concat(iptable + "\n");
    }
  });

  return rules;
}

FirewallGenerator.prototype.writeCustomRules = function(firewall_rules) {
  var rules = "";

  firewall_rules.forEach(function(firewall_rule) {
    var iptable = customFirewall(firewall_rule.type, firewall_rule.port_base, firewall_rule.port_max);
    rules = rules.concat(iptable + "\n");
  });

  return rules;
}

FirewallGenerator.prototype.validate = function(config) {
  return (config && (config.firewall || config.firewall_rules));
}

FirewallGenerator.prototype.generate = function(config, path) {
  var firewall = config.firewall ? config.firewall : config.depList.firewall;
  var firewall_rules = config.firewall_rules ? config.firewall_rules : config.depList.firewall_rules;

  var iptables = this.template.join("\n") + "\n";
  iptables = iptables.replace("{enabled}", config.firewall.enabled ? "1" : "0");

  /* Define sip rules */
  //var sipRules = this.writeSIPRules(config);
  /* Define rtp rules */
  //var rtpRules = customFirewall("udp", config.sip_ports.rtp_proxy_port_base, config.sip_ports.rtp_proxy_port_max);
  /* Define custom rules */
  var customRules = this.writeCustomRules(firewall_rules);

  iptables = iptables.concat(customRules + "\n");

  var fileWriter = new File(path + "/" + this.name, "w+");
  fileWriter.writeLine(iptables);
  fileWriter.close();
}

module.exports = FirewallGenerator;