const dns = require('dns');

dns.resolve4('google.com', (err, addresses) => {
  console.log('Error:', err);
  console.log('Addresses:', addresses);
});