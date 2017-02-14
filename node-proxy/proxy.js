const commandLineArgs = require('command-line-args'),
      http = require('http'),
      httpProxy = require('http-proxy');

const optionDefinitions = [
  { name: 'targetHost', alias: 'h', type: String },
  { name: 'targetPort', alias: 'p', type: Number },
  { name: 'proxyHost', type: String, defaultValue: 'localhost' },
  { name: 'proxyPort', type: Number, defaultValue: 9009 }
]

const options = commandLineArgs(optionDefinitions)
const target = 'https://' + options.targetHost + ':' + options.targetPort;

var proxy = httpProxy.createProxyServer({
  target: target,
  secure: false	// Bypass certificate validation
});

proxy.on('error', function(err, req, res) {
  console.log('Error occured', err);
  res.end();
});

proxy.on('proxyRes', function (proxyRes, req, res) {
  proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type';
  proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
  proxyRes.headers['Access-Control-Allow-Origin'] = '*';
});


http.createServer(function (req, res) {
  if (req.method === 'OPTIONS') {
    // Preflight request to OpenShift results in 403... So we cheat :>
    res.writeHead(200, { 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Requested-With,content-type,Authorization'
    });
    res.end();
  } else {
    proxy.web(req, res);      
  }
  
}).listen(options.proxyPort, options.proxyHost);

console.log('Proxy running at', options.proxyHost, options.proxyPort);

process.on('SIGINT', function() {
    process.exit(); // Needed for Docker container
});
