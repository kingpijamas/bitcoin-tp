'use strict';

var commons = require('../../commons.js');

module.exports = function homeControllerController(req, res) {
    var validateAndSignByOracle = commons.service("oracleValidation");
    var signByDestination = commons.service("destinationSignature");
    var broadcastTransaction = commons.service("destinationBroadcast");

    var validCondition = false;

    const showError = (contract) => {
        if (contract == null) {
            res.render('validate', {isSigned: 'No', isValid: 'The condition is not valid'})
        }
    };

    const showSignatureResult = (fullySigned, valid) => {
        var validation = null;
        if (valid) {
            validation = 'The condition is valid';
        } else {
            validation = 'The condition is not valid';
        }

        if (fullySigned) {
            res.render('validate', {isSigned: 'Signed by oracle and destination', isValid: validation})
        } else {
            res.render('validate', {isSigned: 'Not fully signed', isValid: validation})
        }
    }

    if (req.method === "GET") {
        res.render('validate');
    } else if (req.method === "POST") {
        var destPrivKey = req.body.privkeyWIF;
        var condition = req.body.condition;
        var transaction = JSON.parse(req.body.incompleteTr);
        var amountForDest = parseInt(req.body.amountForDest);

        if (req.body.validate) {

            validateAndSignByOracle(destPrivKey, condition, amountForDest, transaction).then(contractSignedByOracle => {
                if (contractSignedByOracle == null) {
                    validCondition = false;
                    showError(contractSignedByOracle)
                } else {
                    validCondition = true;
                }

                var contractSignedByDestination = null;
                if (validCondition) {
                    var contractSignedByDestination = signByDestination(destPrivKey, contractSignedByOracle);
                    var fullySigned = contractSignedByDestination.incompleteTx.isFullySigned();
                    if (fullySigned) {
                        broadcastTransaction(destPrivKey, contractSignedByDestination);
                    }
                }
                showSignatureResult(fullySigned, validCondition);
            }).catch(error => {
                showSignatureResult(false, false);
            });

        }
    }

};