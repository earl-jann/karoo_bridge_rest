"use strict"

var console = require("console");
var common = require("./common.js");
var ConfigGenerator = require("./config.generator");

var karooPath = function(file, type) {
  var path = "";
  if(file.length > 0 && file.trim()) {
    path = common.uploadPath + "/" + type + "/" + file;
  }
  return path;
}

/*
 * Class TlsGenerator 
 */

var TlsGenerator = function() {
  this.name = "tls.cfg";

  ConfigGenerator.call(this, this.name);
}

TlsGenerator.prototype = Object.create(ConfigGenerator.prototype);

TlsGenerator.prototype.validate = function(config) {
  return (config && config.tls);
}

TlsGenerator.prototype.writeRoot = function(config, root, configWriter) {
  root.addString("tls-ca-file").set(karooPath(config.tls.tls_ca_file, "tlsCaFile"));
  root.addString("tls-ca-path").set(config.tls.tls_ca_path);
  root.addString("tls-certificate-file").set(karooPath(config.tls.tls_certificate_file, "tlsCertificateFile"));
  root.addString("tls-private-key-file").set(karooPath(config.tls.tls_private_key_file, "tlsPrivateKeyFile"));
  root.addString("tls-cert-password").set(config.tls.tls_cert_password);
  root.addBool("tls-verify-peer").set(config.tls.tls_verify_peer);
};

module.exports = TlsGenerator;