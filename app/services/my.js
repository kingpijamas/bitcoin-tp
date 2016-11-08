'use strict';

var commons = require('../commons.js');
var bitcore = require('bitcore-lib');

var bitcoreExplorers = require('bitcore-explorers');
var Script  = bitcore.Script;

var sjclHash = require('sjcl').hash;

var proto
  , repo = commons.repository
  ;

module.exports = function MyService() {
  var network = 'testnet';
  var privKey = bitcore.PrivateKey(network); // TODO bitcore.PrivateKey.fromWIF(...);
  var oraclesPubKey = ''; // TODO

  this.call = function() {
    // crear output
    // var inputScript = Script('OP_1');
    var script = "if (true) return (10.0, 1JxgRXEHBi86zYzHN2U4KMyRCg4LvwNUrp);";
    var scriptsHash = sjclHash.sha256(hash);

     var tx = bitcore.Transaction()
      .from(originUtxos)
      .script();

    var outputScript = Script(scriptsHash + ' OP_DROP 2 ' + destsPubKey + ' ' + oraclesPubKey + ' CHECKMULTISIG');
  }
};

proto = module.exports.prototype;
