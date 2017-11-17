"use strict"

var console = require("console");
var ConfigGenerator = require("./config.generator");

var karooPath = function(file, type) {
  var path = "";
  if(file.length > 0 && file.trim()) {
    path = "%KAROO_CONFIG_DIRECTORY%/config/uploads/tls/" + type + "/" + file;
  }
  return path;
}

var TlsGenerator = function() {
  this.name = "tls.cfg";
}

TlsGenerator.prototype.generate = function(config, path) {
  var configGenerator = new ConfigGenerator(this.name);
  configGenerator.generate(config, path, function(root, configWriter) {
    root.addString("tls-ca-file").set(karooPath(config.tls.tls_ca_file, "ca_file"));
    root.addString("tls-ca-path").set(config.tls.tls_ca_path);
    root.addString("tls-certificate-file").set(karooPath(config.tls.tls_certificate_file, "cert_file"));
    root.addString("tls-private-key-file").set(karooPath(config.tls.tls_private_key_file, "ca_file"));
    root.addString("tls-cert-password").set(config.tls.tls_cert_password);
    root.addBool("tls-verify-peer").set(config.tls.tls_verify_peer);
  });
}

module.exports = TlsGenerator;