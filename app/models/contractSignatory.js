'use strict';

const commons = require('../commons.js');
const keyedEntity = require('./keyedEntity.js');
const bitcore = require('bitcore-lib');

const bitcoreExplorers = require('bitcore-explorers');
const Insight = bitcoreExplorers.Insight;

const network = 'testnet';

/*class ContractSignatory extends keyedEntity.KeyedEntity {
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
}*/
