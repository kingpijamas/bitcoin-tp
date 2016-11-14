'use strict';

const KeyedEntity = require('../models/keyedEntity');
const ContractSignatory = require('../models/contractSignatory');
const Origin = require('../models/origin');
const Destination = require('../models/destination');
const Oracle = require('../models/oracle');


var commons = require('../commons.js');

var proto, repo = commons.repository;


const bitcore = require('bitcore-lib');

const bitcoreExplorers = require('bitcore-explorers');
const Insight = bitcoreExplorers.Insight;

const buffer = require('buffer');

const network = 'testnet';
const ORACLE_PRIV_KEY = 'cSXfd8DuArnMr3HhRzZh1yXd7QKNv3ChEuvS6WV4Df8NTv7nZjAW';

module.exports = function validateAndSignByOracle(destPrivKey, condition, amountForDest, transactionJson) {

    const destination = new Destination(destPrivKey);
    const oracle = new Oracle(ORACLE_PRIV_KEY);
    var destAddress = destination.address;
    console.log(destAddress);

    var transaction = bitcore.Transaction(transactionJson);

    var contract = {
        condition: condition,
        expression: destination.generateContractExpression(condition, destAddress, amountForDest),
        destAddress: destAddress,
        incompleteTx: transaction
    };

    const signIfValid = function(found) {
        if(found>0){
            return oracle.signContract(contract)
        }
    };

    var http = require('http');
    var htmlparser = require("htmlparser2");
    //var searchText = "lluvias";
    var searchText = contract.condition;

    const getContent = function(url) {
        // return new pending promise
        return new Promise((resolve, reject) => {
            // select http or https module, depending on reqested url
            const lib = url.startsWith('https') ? require('https') : require('http');
            const request = lib.get(url, (response) => {
                // handle http errors
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error('Failed to load page, status code: ' + response.statusCode));
                }
                // temporary data holder
                const body = [];
                // on every content chunk, push it to the data array
                response.on('data', (chunk) => body.push(chunk));
                // we are done, resolve promise with those joined chunks
                response.on('end', () => resolve(body.join('')));
            });
            // handle connection errors of the request
            request.on('error', (err) => reject(err))
        })
    };

    const contentPromise = getContent('http://servicios.lanacion.com.ar/pronostico-del-tiempo/capital-federal/capital-federal')

    var foundResult = contentPromise.then(content => {
        var found = 0;
        var parser = new htmlparser.Parser({
            ontext: function(text) {
                if (text.includes(searchText)) {
                    found++;
                    console.log(searchText);
                };
            }
        }, {
            decodeEntities: true
        });
        parser.write(content);
        parser.end();
        return found;
    }).catch(e => console.log("Got error: " + e.message));

    return foundResult.then((result) =>
        signIfValid(result)
    );
};

proto = module.exports.prototype;
