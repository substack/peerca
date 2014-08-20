var tls = require('tls');
var ca = require('../')({ dir: 'keys/client' });
var opts = ca.options('localhost');

var stream = tls.connect(7007, 'localhost', opts);
stream.pipe(process.stdout);
