'use strict';

var commons = require('../../commons.js');

module.exports = function homeControllerController(req, res) {
    var validateAndSignByOracle = commons.service("oracleValidation");

    const showValidation = (contract) => {
        if (contract == null) {
            res.render('validate', {isSigned: 'No', isValid: 'The condition is not valid'})
        } else {
            res.render('validate', {isSigned: 'Signed by oracle', isValid: 'The condition is valid'})
        }
    };

    if (req.method === "GET") {
        res.render('validate');
    } else if (req.method === "POST") {
        var destPrivKey = req.body.privkeyWIF;
        var condition = (req.body.condition === 'true');
        var transaction = JSON.parse(req.body.incompleteTr);
        var amountForDest = parseInt(req.body.amountForDest);

        if (req.body.sign) {
            //TODO: la idea es que después de firmar ponga "isSigned: 'true'"
            //TODO: llamar al servicio con los parámetros: @req.body.condition, @req.body.privkeyWIF y @req.body.incompleteTx
                res.render('validate', {isSigned: 'isSigned', isValid: 'isValid'})
        } else if (req.body.validate) {

            var contractSignedByOracle = validateAndSignByOracle(destPrivKey, condition, amountForDest, transaction);


            //contractSignedByOracle.then((contract) => 
            showValidation(contractSignedByOracle);
            //).catch(console.log);
        }
    }

};