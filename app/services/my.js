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

            var hash = new Buffer(safeHash(contract.expression));

            const oracleScript = Script()
                .add(hash)
                .add('OP_DROP')
                .add('OP_2')
                .add(dest.pubKey.toBuffer())
                .add(oracle.pubKey.toBuffer())
                .add('OP_2')
                .add('OP_CHECKMULTISIG');

            console.log(oracleScript);

            contract.outputScript = oracleScript;

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
            let insight = new Insight(network);
            insight.broadcast(completeTx.toString(), (err, res) => console.log(err, res))
        }
    }

    class Oracle extends KeyedEntity {
        measurement(contract) {

            //TODO ver si podemos comparar hasheando en vez de la comparacion de abajo
           // console.log(new Buffer(safeHash(contract.expression)).toString());

            //var hash = new Buffer(safeHash(contract.expression)).toString();
            //if(contract.incompleteTx.outputs[0].script.toString().includes(hash)) {
             //   console.log("si");
            //}

            // comparación del outputScript que mandó el nieto (y creó el abuelo)
            // con el outputScript de la transacción incompleta que mandó el nieto
            //el outputScript contiene el hash de la expresión
            if (contract.incompleteTx.outputs[0].script.toString() !== contract.outputScript.toString()) {
                throw "Contract mismatch!";
            }
            let result = eval(contract.expression);
            if (result.destAddress != contract.destAddress) {
                throw "Mismatching expression address!";
            }
            console.log(`Contract: ${JSON.stringify(contract)} approved!`);
            return contract.incompleteTx.sign(this.privKey);
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
