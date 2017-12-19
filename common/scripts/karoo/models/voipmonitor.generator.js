'use strict'

var console = require("console");
var File = require("file").File;

var VoipMonitorGenerator = function() {
  this.name = "voipmonitor.conf";
  this.template = [ "[general]",
    "id_sensor = 8",
    "sqldriver = mysql",
    "mysqlhost = {mysqlhost}",
    "mysqlport = {mysqlport}",
    "mysqlusername = {mysqlusername}",
    "mysqlpassword = {mysqlpassword}",
    "mysqldb = voipmonitor",
    "cdr_partition = yes",
    "mysqlcompress = yes",
    "mysqlloadconfig = yes",
    "sqlcallend = yes",
    "mysqlstore_max_threads_register = 6",
    "cleandatabase_register_failed = 1",
    "cleandatabase_register_state = 1",
    "interface = any",
    "promisc = no",
    "managerip = 0.0.0.0",
    "managerport = 5029",
    "cdr_sipport = yes",
    "cdr_rtpport = yes",
    "absolute_timeout = 14400",
    "destroy_call_at_bye = 1200",
    "onewaytimeout = 15",
    "ringbuffer = 50",
    "packetbuffer_enable = yes",
    "packetbuffer_compress = no",
    "packetbuffer_compress_ratio	= 100",
    "max_buffer_mem = 2000",
    "cdrproxy = yes",
    "sip-register = yes",
    "sip-register-timeout = 5",
    "sip-register-active-nologbin = yes",
    "nocdr = no",
    "spooldir = /var/spool/voipmonitor",
    "pcap_dump_bufflength = 8184",
    "pcap_dump_zip = yes",
    "pcap_dump_ziplevel_sip = 6",
    "pcap_dump_zip_rtp = lzo",
    "pcap_dump_writethreads = 1",
    "pcap_dump_writethreads_max = 32",
    "pcap_dump_asyncwrite = yes",
    "tar = yes",
    "tar_maxthreads = 8",
    "tar_compress_sip = gzip",
    "tar_sip_level = 6",
    "tar_compress_rtp = no",
    "tar_rtp_level = 1",
    "tar_compress_graph = gzip",
    "tar_graph_level = 1",
    "savesip = yes		",
    "savertp = yes",
    "savertcp = yes",
    "saveaudio_stereo = yes",
    "ogg_quality = 0.4 ",
    "savegraph = yes",
    "maxpoolsize		= 102400",
    "maxpoolsize_2		= 102400",
    "autocleanspoolminpercent = 1",
    "autocleanmingb = 5",
    "mos_g729 = no",
    "mos_lqo = no",
    "mos_lqo_bin = pesq",
    "mos_lqo_ref = /usr/local/share/voipmonitor/audio/mos_lqe_original.wav",
    "mos_lqo_ref16 = /usr/local/share/voipmonitor/audio/mos_lqe_original_16khz.wav",
    "dscp = yes"
  ];
}

VoipMonitorGenerator.prototype.writeSIPPorts = function(listeners) {
  var sipPorts = "";
  if(listeners) {
    listeners.forEach(function(listener) {
      if(listener.tcp_enabled || listener.udp_enabled) {
        sipPorts += "sipport = " + listener.sip_port + "\n";
      }
      if(listener.tls_enabled) {
        sipPorts += "sipport = " + listener.tls_port + "\n";
      }
    });
  }

  return sipPorts;
}

VoipMonitorGenerator.prototype.validate = function(config) {
  return (config && config.voipmonitor);
}

VoipMonitorGenerator.prototype.generate = function(config, path) {
  var voipmonitor = this.template.join("\n") + "\n";
  var listeners = config.listeners ? config.listeners : config.depList.listeners;
  
  voipmonitor = voipmonitor.replace("{mysqlhost}", config.voipmonitor.mysqlhost)
                           .replace("{mysqlport}", config.voipmonitor.mysqlport)
                           .replace("{mysqlusername}", config.voipmonitor.mysqlusername)
                           .replace("{mysqlpassword}", config.voipmonitor.mysqlpassword);

  voipmonitor += this.writeSIPPorts(listeners)

  var fileWriter = new File(path + "/" + this.name, "w+");
  fileWriter.writeLine(voipmonitor);
  fileWriter.close();
}

module.exports = VoipMonitorGenerator;