'use strict';
var commons = require('../../commons.js');

module.exports = function generateControllerController(req, res) {
    var sendMoneyToMultisig = commons.service("generateContract");
    var startContract = commons.service("makeContract");

    if (req.method === "GET") {
        res.render('generate');
    } else if (req.method === "POST") {
        var originPrivKey = req.body.privkeyWIF;
        var destPubKey = req.body.destPubKey;
        var amountToMultisig = parseInt(req.body.amountMulti);
        var condition = (req.body.condition === 'true');

        if (req.body.bet) {
            //adding money for fee
            var link = sendMoneyToMultisig(amountToMultisig * 2, originPrivKey, destPubKey);

            link.then((linkString) =>
                res.render('generate', {link: linkString})
            ).catch(console.log);
        } else if (req.body.contract) {

            var contractIncomplete = startContract(originPrivKey, destPubKey, condition, amountToMultisig);

            contractIncomplete.then((contract) =>
                //console.log(contract.incompleteTx.toJSON().toString())
                res.render('generate', {json: JSON.stringify(contract.incompleteTx.toJSON())})
            ).catch(console.log);


            //res.render('generate', {title:'data generated', link: link, json:'{lalal}'});
        }
    }
};