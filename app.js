var restify = require('restify');
var plugins = require('restify').plugins;
const corsMiddleware = require('restify-cors-middleware')

var mysql = require('mysql');

var config = require('./config/config');
var executeQuery = require('./db/executeQuery');

// log4j
const log4js = require('log4js');
log4js.configure({
  appenders: { openjet: { type: 'file', filename: './logs/StdErr_ErrorLog.log' } },
  categories: { default: { appenders: ['openjet'], level: 'debug' } }
});
const logger = log4js.getLogger('app');

var connectionState = false;

// Database connection
db = mysql.createConnection(config.db);
db.connect((err)=>{
    if(err) {
        console.log("connection lost: ", err);
        logger.error("connection lost: ", err)
        connectionState = false;
        // throw err;
    } else {
        console.log("DB '", config.db.database, "' Connected.");
        logger.info("DB '", config.db.database, "' Connected.");
        connectionState = true;
    }
    
});

db.on('close', function (err) {
    logger.error('mysqldb conn close');
    connectionState = false;
  });
  db.on('error', function (err) {
    logger.error('mysqldb error: ' + err);
    connectionState = false;
  });

  executeQuery.attemptConnection(db,connectionState);
  
// server started
var server = restify.createServer({
    name: 'openjetAPI',
    versions: ['1.0.0', '2.0.0']
});
const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['*'],
    allowHeaders: ['Access-Control-Allow-Headers','access-control-allow-origin','Content-Type']
});

    server.use(plugins.bodyParser({ mapParams: false })); //for body data 
    server.use(restify.plugins.queryParser());//for query params 
    server.pre(cors.preflight)
    server.pre((req,res,next)=>{
       // let pieces = req.url.replace(/^\/+/, '').split('/');
        // let version = pieces[0];
        
        // version = version.replace(/v(\d{1})\.(\d{1})\.(\d{1})/, '$1.$2.$3');
        // version = version.replace(/v(\d{1})\.(\d{1})/, '$1.$2.0');
        // version = version.replace(/v(\d{1})/, '$1.0.0');

        // if (server.versions.indexOf(version) > -1) {
        //     req.url = req.url.replace(pieces[0] + '/', '');
        //     req.headers = req.headers || [];
        //     req.headers['accept-version'] = version;
        // }
        // else if(server.versions.indexOf(version) == -1)
        //     return res.send(400, {DisplayMessage:"VERSION NOT SUPPORT"});
    
        return next();
       
    });
    server.use(cors.actual);

server.listen(config.port,()=>{    
    require('./routes')(server);
    console.log(" openjet Server started on port: ", config.port);
});
