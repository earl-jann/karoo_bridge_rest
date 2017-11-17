'use strict'

var console = require("console");
var File = require("file").File;

var customFirewall = function(type, base, max) {
  var iptables = "$IPTABLES -A INPUT -p {type} -m {type}  --dport {port}  -m state --state NEW  -j ACCEPT";
  var port = "" + base;
  if(base < max) {
    port = port.concat(":" + max);
  }

  return iptables.replace(new RegExp("{type}", 'g'), type.toLowerCase())
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

FirewallGenerator.prototype.generate = function(config, path) {
  var firewall = this.template.join("\n") + "\n";
  firewall = firewall.replace("{enabled}", config.firewall.enabled ? "1" : "0");
  config.firewall_rules.forEach(function(rules) {
    var iptable = customFirewall(rules.type, rules.port_base, rules.port_max);
    firewall = firewall.concat(iptable + "\n");
  });

  var fileWriter = new File(path + "/" + this.name, "w+");
  fileWriter.writeLine(firewall);
  fileWriter.close();
}

module.exports = FirewallGenerator;