const dns = require('dns');

dns.setServers(['1.1.1.1', '1.0.0.1']);

dns.resolveSrv(
  '_mongodb._tcp.cluster0.vng1pby.mongodb.net',
  (err, records) => {
    console.log(err);
    console.log(records);
  }
);