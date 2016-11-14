'use strict';

const ContractSignatory = require('./contractSignatory');

const bitcore = require('bitcore-lib');

const bitcoreExplorers = require('bitcore-explorers');
const Insight = bitcoreExplorers.Insight;

const network = 'testnet';

class Destination extends ContractSignatory { // destination: grandson

    signContract(contract) {
        const completeTransaction = contract.incompleteTx.sign(this.privKey);
        console.log(completeTransaction);
        console.log(completeTransaction.isFullySigned());
        contract.incompleteTx = completeTransaction;
        return contract;
    }
}

module.exports = Destination;