'use strict';

var commons = require('../commons.js');
var bitcore = require('bitcore-lib');

var bitcoreExplorers = require('bitcore-explorers');
var Script = bitcore.Script;

var sjclHash = require('sjcl').hash;

var Insight = require('bitcore-explorers').Insight;

var proto, repo = commons.repository;

var network = 'testnet';

module.exports = function MyService() {
    class KeyedEntity {
        constructor(privKey, pubKey) {
            this.privKey = privKey;
            this.pubKey = pubKey;
        }
    }

    class ContractResponse {
        constructor(pubKey, amount) {
            this.pubKey = pubKey;
            this.amount = amount;
        }
    }

    class Origin extends KeyedEntity { // 'grandparent'
        getUtxos() {
            var _utxos = null;
            insight.getUnspentUtxos(address, (error, utxos) => {
                    if (error) { throw error }
                    _utxos = utxos;
                }
            );
            while(!_utxos) {}; // FIXME: ugly as hell
            return _utxos;
        }

        startContract(expression, fromAddress, amount, oracle, dest) {
            // TODO: multiply amount by the minimum allowed (10^5 satoshis?)
            var contract = `if (${expression}) { return new ContractResponse(${dest.pubKey}, ${amount}) }`;

            var oracleScript = Script()
                .add(hash(contract)) // TODO: check !
                .add('OP_DROP 2') // TODO: check!
                .add(dest.pubKey) // TODO: check!
                .add(oracle.pubKey) // TODO: check!
                .add('CHECKMULTISIG');

            var utxos = this.getUtxos(fromAddress);

            var incompleteTx = bitcore.Transaction()
                .from(utxos)
                .addOutput(oracleScript.toScriptHashOut())
                .to(address, amount) // TODO: check!
                // .change(address) // TODO: add me eventually
                // .fee(100000) // TODO: add me eventually
                .sign(this.privkey);
            return incompleteTx;
        }
    }

    class Destination extends KeyedEntity { // destination: grandson
        // TODO: add logic!
    }

    class Origin extends KeyedEntity {
        measurement(expression, outputScript, incompleteTx) {
            if (hash(expression) != outputScript) { // TODO: check!
                throw "Mismatching hash";
            }
            if (evaluate(expression) != outputScript.destinationAddress) { // TODO: check!
                throw "Expression not true!";
            }
            var completeTx = incompleteTx.sign();
            return completeTx; // TODO: send to dest... or just broadcast it
        }
    }

    var origin = new Origin('', ''); // TODO: check!
    var dest = new Destination('', ''); // TODO: check!
    var oracle = new Oracle('', ''); // TODO: check!

    var incompleteTx = origin.startContract('true', fromAddress, 1000000, oracle, dest);
    // var completeTx = oracle.measurement(???, ???, ???); TODO: continue code!

    // var privKey = bitcore.PrivateKey(network); // TODO bitcore.PrivateKey.fromWIF(...);
    // var oraclesPubKey = ''; // TODO
};

proto = module.exports.prototype;
