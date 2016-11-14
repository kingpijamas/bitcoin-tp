'use strict';

const KeyedEntity = require('./keyedEntity');


const bitcore = require('bitcore-lib');

const bitcoreExplorers = require('bitcore-explorers');
const Insight = bitcoreExplorers.Insight;

const network = 'testnet';
const Script = bitcore.Script;

class Oracle extends KeyedEntity {

    signContract(contract) {
        const safeHash = (value) => { return bitcore.crypto.Hash.sha256(new Buffer(value)).toString() };

        //Verify that the hash of the plane expression is the same as the one in the transaction
        const planeExpression = contract.expression;
        const scriptWithHashedExpression = contract.incompleteTx.outputs[1].script;

        const expectedScript = new Script()
            .add('OP_RETURN')
            .add(new Buffer(safeHash(planeExpression)));
        if (expectedScript.toString() !== scriptWithHashedExpression.toString()) {
            throw "Contract mismatch!";
        }

        //Verify if the condition is true
        if (!this.verifyCondition(contract)) {
            console.log("condition is false");
            return null;
        }

        // If everything is fine, the oracle signs the transaction
        const signedByOracleTransaction = contract.incompleteTx.sign(this.privKey);
        console.log(signedByOracleTransaction);
        contract.incompleteTx = signedByOracleTransaction;
        return contract;
    }

    verifyCondition(contract) {
        let result = eval(contract.expression);
        return result != undefined;
    }
}

module.exports = Oracle;