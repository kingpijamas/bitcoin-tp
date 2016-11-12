'use strict';

var commons = require('../commons.js');
var proto, repo = commons.repository;

const bitcore = require('bitcore-lib');
const Script = bitcore.Script;
const Output = bitcore.Transaction.Output;

const bitcoreExplorers = require('bitcore-explorers');
const Insight = bitcoreExplorers.Insight;

const buffer = require('buffer');
const network = 'testnet';
const MIN_SATOSHIS = 100000;

module.exports = function MyService() {
    const safeHash = (value) => { return bitcore.crypto.Hash.sha256(new Buffer(value)).toString() };

    class KeyedEntity {
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

    class ContractSignatory extends KeyedEntity {
        generateContractExpression(contractCondition, dest, amount) {
            return `if (${contractCondition}) { ({ destAddress: '${dest.address}', amount: ${amount} }) }`;
        }
    }

    class Origin extends ContractSignatory { // 'grandparent'
        startContract({condition, fromAddress, amount, oracle, dest}) {
            // FIXME: change this for custom JSON evaluation!
            const contract = {
                condition: condition,
                expression: this.generateContractExpression(condition, dest, amount),
                destAddress: dest.address
            };

            const oracleScript = Script()
                .add(safeHash(contract.expression))
                .add('OP_DROP')
                .add('OP_2')
                .add(dest.pubKey)
                .add(oracle.pubKey)
                .add('OP_2') //To make it checkMultisign
                .add('CHECKMULTISIG');

            return this.getUtxos(fromAddress).then((utxos) => {
                contract.incompleteTx = bitcore.Transaction()
                    .from(utxos)
                    .addOutput(new Output({satoshis: 0, script: oracleScript}))
                    .to(contract.destAddress, amount) // TODO: check!
                    // .change(address) // TODO: add me eventually
                    // .fee(100000) // TODO: add me eventually
                    .sign(this.privkey);

                return contract;
            }).catch(console.log);
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

    class Destination extends ContractSignatory { // destination: grandson
        acceptContract(contract, amount, oracle) {
            const contractExpression = this.generateContractExpression(contract.condition, dest, amount);
            if (safeHash(contract.expression) != safeHash(contractExpression)) {
                throw "Contract mismatch!";
            }
            contract.incompleteTx = contract.incompleteTx.sign(this.privKey);
            return contract;
        }

        collect(completeTx) {
            // TODO: broadcast this!
        }
    }

    class Oracle extends KeyedEntity {
        measurement(contract, oracleScript) {
            if (safeHash(contract.expression) != safeHash(contract.expression)) { // FIXME: duh! fetch it from the tx itself I suppose :P
                throw "Contract mismatch!";
            }
            let result = eval(contract.expression);
            if (result.destAddress != contract.destAddress) { // TODO: check! maybe the amount should match contract.amount as well
                throw "Mismatching expression address!";
            }
            console.log(`Contract: ${JSON.stringify(contract)} approved!`);
            return contract.incompleteTx.sign(this.privKey); // TODO: send to dest... or just broadcast it
        }
    }

    const originPrivKeyWIF = 'cPT4Pgi9avWHt2ex4rmhxKzr9qPWYp8vsJiZfRFaG5vBDeHdufpq'; // address with BTC in it
    // bitcore.PrivateKey(network).toWIF(); // TODO: receive from user input!
    const origin = new Origin(originPrivKeyWIF); // TODO: check!

    const destPrivKeyWIF = 'cMbjKHpbGvU2BbhjTs1wcBmVs3ePyPR83L9r3vEV2y7yecTMXgiR';
    // bitcore.PrivateKey(network).toWIF(); // TODO: receive from user input!
    const dest = new Destination(destPrivKeyWIF); // TODO: check!

    const oraclePrivKeyWIF = 'cSXfd8DuArnMr3HhRzZh1yXd7QKNv3ChEuvS6WV4Df8NTv7nZjAW';
    // bitcore.PrivateKey(network).toWIF(); // TODO: load from file in server!
    const oracle = new Oracle(oraclePrivKeyWIF); // TODO: check!

    const fromAddress = origin.address;
    const amount = MIN_SATOSHIS;
    const condition = 'true'; // some boolean expression
    const contractPromise = origin.startContract({condition, fromAddress, amount, oracle, dest});

    const acceptedContractPromise = contractPromise.then((contract) =>
        dest.acceptContract(contract, amount, oracle)
    ).catch(console.log);

    const completeTxPromise = acceptedContractPromise.then((contract) =>
        oracle.measurement(contract)
    ).catch(console.log);

    completeTxPromise.then((completeTx) =>
        dest.collect(completeTx)
    ).catch(console.log);
};

proto = module.exports.prototype;
