'use strict';

var os = require('os');
var fs = require('fs-extra');

var seedFile = "./seeder.lock";

var loadSeederFile = function() {
  var seeders = {};
  try {
    if(fs.existsSync(seedFile)) {
      var data = fs.readFileSync("./seeder.lock", "utf8");
      return JSON.parse(data);
    }

    return seeders;
  } catch(err) {
    throw err;
  }
}

var writeSeederFile = function(data) {
  try {
    fs.writeFileSync(seedFile, JSON.stringify(data));
  } catch(err) {
    throw err;
  }
}

var getLocalInterfaces = function() {
  var result = [];

  var interfaces = os.networkInterfaces();
  for(var key in interfaces) {
    interfaces[key].forEach((networkInterface) => {
      //filter non-loopback interfaces and IPv4 only
      if(!networkInterface.internal && networkInterface.family === 'IPv4') {
        networkInterface.adapter = key;
        result.push(networkInterface);
      }
    });
  }

  return result;
}

module.exports = function(app) {
  var Models = app.models;
  var localInterfaces = getLocalInterfaces();
  var defaultLocalInterface = localInterfaces.length >= 1 ? localInterfaces[0] : null; 
  var seedData = loadSeederFile();

  var interfaceSeeder = function() {
    if(seedData.config_sip_listeners_interfaces && seedData.config_sip_listeners_interfaces === 1) {
      return;
    }

    console.log("Running Interface Seeder");

    var InterfaceModel = Models.config_sip_listeners_interfaces;

    localInterfaces.forEach(function(networkInterface) {
      InterfaceModel.create({
        id: networkInterface.adapter + "-interface",
        description: "",
        ip_address: networkInterface.address,
        external_address: "",
        tcp_enabled: true,
        udp_enabled: true,
        ws_enabled: true,
        wss_enabled: true,
        tls_enabled: true,
        sip_port: 5060,
        tls_port: 5061,
        ws_port: 5062,
        wss_port: 5063,
        subnets: ""
      });
    });

    seedData.config_sip_listeners_interfaces = 1;

    console.log("Running Interface Seeder: Done");
  };

  var carpSeeder = function() {
    if(seedData.config_sip_listeners_carp && seedData.config_sip_listeners_carp === 1) {
      return;
    }

    console.log("Running Carp Seeder");

    var Carp = Models.config_sip_listeners_carp;

    if(defaultLocalInterface) {
      Carp.create({
        id: "carp_ha_interface",
        enabled: false,
        virtual_ip_address: "0.0.0.0/0",
        interface_name: defaultLocalInterface.adapter,
        description: "",
        src_address: defaultLocalInterface.address,
        carp_password: "12345678",
        vhid: 9,
        preferred_master: false,
        external_address: "",
        tcp_enabled: true,
        udp_enabled: true,
        ws_enabled: true,
        wss_enabled: true,
        tls_enabled: true,
        sip_port: 5060,
        tls_port: 5061,
        ws_port: 5062,
        wss_port: 5063,
        subnets: ""        
      });
    }
    
    seedData.config_sip_listeners_carp = 1;

    console.log("Running Carp Seeder: Done");
  };

  var tlsSeeder = function() {
    if(seedData.config_tls && seedData.config_tls === 1) {
      return;
    }

    console.log("Running TLS Seeder");

    var TLS = Models.config_tls;
    TLS.create({
      id: "tls",
      tls_ca_file: "ca.crt",
      tls_ca_path: "/etc/karoo.conf.d/ssl/ca",
      tls_certificate_file: "karoo.crt",
      tls_private_key_file: "karoo.key",
      tls_cert_password: "demo",
      tls_verify_peer: true
    });

    seedData.config_tls = 1;

    console.log("Running TLS Seeder: Done");
  };

  var autobanSeeder = function() {
    if(seedData.config_sip_listeners_autoban && seedData.config_sip_listeners_autoban === 1) {
      return;
    }

    console.log("Running Autoban Seeder");

    var Autoban = Models.config_sip_listeners_autoban;
    var AutobanWhiteList = Models.config_sip_listeners_autoban_packetratewhitelist;

    Autoban.create({
      id: "autoban",
      packet_rate_min_treshold: 50,
      packet_rate_max_treshold: 100,
      packet_rate_treshold_ban_duration: 3600,
      execute_on_ban: "",
      auto_null_route_on_ban: false
    });

    localInterfaces.forEach(function(networkInterface) {
      if(networkInterface.cidr) {
        AutobanWhiteList.create({
          type: "source-network",
          address: networkInterface.cidr
        });
      }
    });

    seedData.config_sip_listeners_autoban = 1;

    console.log("Running Autoban Seeder: Done");
  }

  var portsSeeder = function() {
    if(seedData.config_sip_listeners_ports && seedData.config_sip_listeners_ports === 1) {
      return;
    }

    console.log("Running Ports Seeder");
    var Ports = Models.config_sip_listeners_ports;
    Ports.create({
      id: "port_ranges",
      sip_tcp_port_base: 10000,
      sip_tcp_port_max: 15000,
      rtp_proxy_port_base: 30000,
      rtp_proxy_port_max: 40000,
      transcoder_port_base: 50000,
      transcoder_port_max: 55000,
    });

    seedData.config_sip_listeners_ports = 1;

    console.log("Running Ports: Done");
  }

  var rtpProxySeeder = function() {
    if(seedData.config_sip_listeners_rtp && seedData.config_sip_listeners_rtp === 1) {
      return;
    }

    console.log("Running RTP Proxy Seeder");
    var RTPProxy = Models.config_sip_listeners_rtp;
    RTPProxy.create({
      id: "rtpproxy",
      rtp_proxy_read_timeout: 300,
      rtp_proxy_transport_thread_count: 10
    });

    seedData.config_sip_listeners_rtp = 1;

    console.log("Running RTP Proxy Seeder: Done");
  }

  var userAgentSeeder = function() {
    if(seedData.config_useragent && seedData.config_useragent === 1) {
      return;
    }

    console.log("Running UA Seeder");

    var UA = Models.config_useragent;
    UA.create({
      id: "user_agent",
      user_agent_name: "OSS Karoo Bridge",
      register_state_in_contact_params: true,
      dialog_state_in_contact_params: true,
      enable_options_routing: false,
      disable_options_keep_alive: false,
      require_rtp_for_registrations: true
    });

    seedData.config_useragent = 1;

    console.log("Running UA Seeder: Done");
  }

  var homerSeeder = function() {
    if(seedData.config_sipcapture_homer && seedData.config_sipcapture_homer === 1) {
      return;
    }

    console.log("Running Homer Seeder");

    var Homer = Models.config_sipcapture_homer;
    Homer.create({
      id: "homer",
      homer_enabled: false,
      homer_version: "2",
      homer_host: defaultLocalInterface.address,
      homer_port: 9060,
      homer_password: "12345678",
      homer_compression: false,
      homer_id: 8
    });

    seedData.config_sipcapture_homer = 1;

    console.log("Running Homer Seeder: Done");
  }

  var voipMonitorySeeder = function() {
    if(seedData.config_sipcapture_voipmonitor && seedData.config_sipcapture_voipmonitor === 1) {
      return;
    }

    console.log("Running VoipMonitor Seeder");

    var VoipMonitor = Models.config_sipcapture_voipmonitor;
    VoipMonitor.create({
      id: "voipmonitor",
      mysqlhost: defaultLocalInterface.address,
      mysqlport: "3306",
      mysqlusername: "mysql",
      mysqlpassword: ""
    });

    seedData.config_sipcapture_voipmonitor = 1;

    console.log("Running VoipMonitor Seeder: Done");
  }

  /** Add seeders here **/
  var seeders = [
    interfaceSeeder,
    carpSeeder,
    tlsSeeder,
    autobanSeeder,
    portsSeeder,
    rtpProxySeeder,
    userAgentSeeder,
    homerSeeder,
    voipMonitorySeeder
  ];

  seeders.forEach(function(seeder) {
    seeder();
  }); 

  writeSeederFile(seedData);
};
