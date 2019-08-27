var mysql = require('mysql');
const log4js = require('log4js');
const logger = log4js.getLogger('executeQuery');

function query(query, next){
    if(!query) return next("No query");
    // console.log(query);
    db.query(query, (err, result)=>{
        if(err) return next(err);
        return next(null,result);
    })
}

function paramQuery(query, params, next){
    if(!query) return next("No query");
     //console.log(query, params);
    db.query(query, params,(err, result)=>{
        if(err) return next(err);
        return next(null,result);
    })
}

function attemptConnection(connection,connectionState) {
    if(!connectionState){
      connection = mysql.createConnection(connection.config);
      connection.connect(function (err) {
        // connected! (unless `err` is set)
        if (err) {
          logger.error('mysql db unable to connect: ' + err);
          connectionState = false;
        } else {
          logger.info('mysql db connected!');
  
          connectionState = true;
        }
      });
      connection.on('close', function (err) {
        logger.error('mysqldb conn close');
        connectionState = false;
      });
      connection.on('error', function (err) {
        logger.error('mysqldb error: ' + err);
  
        if (!err.fatal) {
          //throw err;
        }
        if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
          //throw err;
        } else {
          connectionState = false;
        }
  
      });
    }
  }

exports.query = query;
exports.paramQuery = paramQuery;
exports.attemptConnection = attemptConnection;




