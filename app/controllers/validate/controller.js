'use strict';

var commons = require('../../commons.js');

module.exports = function homeControllerController(req, res) {
    //var myService = commons.service("my");
    //myService(); // call the service
    res.render('validate');

    if (req.method === "GET") {
        res.render('validate');
    } else if (req.method === "POST") {
        if (req.body.sign) {
            //TODO: la idea es que después de firmar ponga "isSigned: 'true'"
            //TODO: llamar al servicio con los parámetros: @req.body.condition, @req.body.privkeyWIF y @req.body.incompleteTx
                res.render('validate', {isSigned: 'isSigned', isValid: 'isValid'})
        } else if (req.body.validate) {
            //TODO: la idea es que después de validar ponga isValid y el valor
            res.render('validate', {isSigned: 'isSigned', isValid: 'isValid'})
        }
    }

};