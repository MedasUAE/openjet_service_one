
var bLogic = require('../controllers/businessLogic');
var errs = require('restify-errors');

module.exports = function (server) {
    server.post({ path: '/submitmedicine'},(req, res, next)=>{ 
        bLogic.fetchAndValidate(req.body,(err,response) => {
            if(err) return res.send(400, {DisplayMessage:err});
            return res.send(200,response);
        });
    })
}


