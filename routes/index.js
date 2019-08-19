
var bLogic = require('../controllers/businessLogic');
var errs = require('restify-errors');

module.exports = function (server) {
     server.get({ path: '/gererateticket/:id', version: '1.0.0' }, (req, res, next) => { 
        ticket.generateTicketByServiceId(req.params.id,(err, response) => {
            if (err) return res.send(400, { DisplayMessage: err });
            return res.send(200, response);
        });
    });

    server.post({ path: '/submitmedicine'},(req, res, next)=>{ 
        bLogic.fetchAndValidate(req.body,(err,response) => {
            if(err) return res.send(400, {DisplayMessage:err});
            return res.send(200,response);
        });
    })

}


