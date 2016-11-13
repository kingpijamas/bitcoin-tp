'use strict';

var commons = require('../commons.js');
var proto, repo = commons.repository;

const bitcore = require('bitcore-lib');
const Script = bitcore.Script;
const MultiSigScriptHashInput = bitcore.Transaction.Input.MultiSigScriptHash;
const Output = bitcore.Transaction.Output;

const bitcoreExplorers = require('bitcore-explorers');
const Insight = bitcoreExplorers.Insight;

const buffer = require('buffer');
const network = 'testnet';
const MIN_SATOSHIS = 100000;

module.exports = function MyService() {
    const safeHash = (value) => { return bitcore.crypto.Hash.sha256(new Buffer(value)).toString() };

    export default class KeyedEntity {
        constructor(privKeyWIF) {
            this.privKey = bitcore.PrivateKey.fromWIF(privKeyWIF); // TODO: polymorphism'd be nice
        }

        get pubKey() {
            return this.privKey.toPublicKey();
        }

        get address() {
            return this.pubKey.toAddress();
        }
    }

    export default class ContractSignatory extends KeyedEntity {
        generateContractExpression(contractCondition, dest, amountDest) {
            return `if (${contractCondition}) { ({ destAddress: '${dest.address}', amount: ${amountDest} }) }`;
        }

        broadcast(tx) {
            const insight = new Insight(network);
            insight.broadcast(tx.toString(), (err, res) =>
                console.log({err: err, res: res})
            );
        }

        getUtxos(fromAddress) {
            return new Promise(
                (resolve, reject) => {
                    let insight = new Insight(network);
                    insight.getUnspentUtxos(fromAddress, (error, utxos) => {
                        if (error) { reject(error) }
                        resolve(utxos);
                    });
                }
            );
        }

    }

    export default class Origin extends ContractSignatory { // 'grandparent'


    }

    export default class Destination extends ContractSignatory { // destination: grandson


    }

    export default class Oracle extends KeyedEntity {


    }


};

proto = module.exports.prototype;
