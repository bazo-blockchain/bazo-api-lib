var assert = require('assert');
var bazolib = require('../index.js');

/*
* Set these variables up at the start!
*/
const serverURL = 'https://fc6cbb95.ngrok.io/';
const rootPubKey = '';
const nonRootPubKey1 = 'dedb0e69150a68503fedfb4f79a462a6da751df9134705ebab941266e9b7854adae4cb8cef04d9538b31263e5eb71ff6af439cde04a28136d8a89a02bbed752f';
const nonRootPrivKey1 = '473ce753cc544ce20f22d267a1540fca622f9cb0edcf3ecf2182bdc1c421a9f9';
const nonRootPubKey2 = 'c213c4556b4fc6fd089dc19d4a2e06a64c90d03c0faf61068e55617eb97bd2318dd24c73623d797bcfbbfbfc781b0d7e6d80ead834cad4f0a2c1f3326ff48298';
const nonRootPrivKey2 = '47159d429c379e57e6523f111958df1c6ebf3fa015517d5409029b254882dd97';
const nonRootPubKey3 = '';
const nonRootPubKey4 = '';
const notRegisteredPubKey = '5c0ac9b2645499a1e63451eca23e14323ff0ed089c169b1f9cd8fbe2eb94b862a971c52731125a6a8a4b646a24e0dce0fb3972dd0e42df42c5eb80e252b5856a'

describe('bazo-api-lib', function() {
  describe('Constructor', function() {
    it('should set the server address to localhost if no URL is given', function() {
      var bazo = new bazolib();
      assert.equal(bazo.serverAddress, 'http://localhost:8001');
    });
    it('should set the server address to the first argument of the constructor', function() {
      var someURL = 'http://someurl.com:8001'
      var bazo = new bazolib(someURL);
      assert.equal(bazo.serverAddress, someURL);
    });
  });
  describe('Account state', function() {
    it('should return a correctly formatted object for existing accounts', function() {
      var bazo = new bazolib(serverURL);
      return bazo.getAccountInfo(nonRootPubKey1)
      .then(function(accountdata){
        assert(typeof accountdata === 'object')
        assert(accountdata.hasOwnProperty('address'))
        assert(accountdata.hasOwnProperty('balance'))
        assert(accountdata.hasOwnProperty('txCnt'))
        assert(accountdata.hasOwnProperty('balance'))
        assert(accountdata.hasOwnProperty('isCreated'))
        assert(accountdata.hasOwnProperty('isRoot'))

        assert(accountdata.address === nonRootPubKey1)
        assert(!accountdata.isRoot)
      });
    });
    it('should not return an object for unregistered accounts', function() {
      var bazo = new bazolib(serverURL);
      return bazo.getAccountInfo(notRegisteredPubKey)
      .then(function(accountdata){
        assert.fail(accountdata, `Account ${notRegisteredPubKey.slice(0,10)}does not exist}`);
      }).catch(function(response) {
        assert(typeof response !== 'object')
        assert(response.match(/does not exist/))
      });
    });
  });
  describe('FundsTx', function() {
    it('should return a correct hash', function() {
      var bazo = new bazolib(serverURL);
      return bazo.getTransactionHash(0, 10, 1, 1, nonRootPubKey1, nonRootPubKey2)
      .then(function(data) {
        assert(data.length === 64)
      });
    });
    it('should throw an error if arguments are missing', function() {
      var bazo = new bazolib(serverURL);
      return bazo.getTransactionHash(0, 10, 1, 1, nonRootPubKey1)
      .then(function(data) {
        assert.fail()
      })
      .catch(function(err) {
        console.log(err);
        assert(true);
      });
    });
    it('should accept a posted transaction', function() {
      var bazo = new bazolib(serverURL);
      return bazo.sendRawTransaction('5c0ce50cc90a469fb2a6c995e43bddf8cd8100c9506948c2c12768b2ed2a40d5', '5c0ce50cc90a469fb2a6c995e43bddf8cd8100c9506948c2c12768b2ed2a40d5')
      .then(function(data) {
        assert(true)
      })
      .catch(function(err) {
        assert.fail('', '')
      });
    });
    it('should be possible to create and sign a transaction', function() {
      var bazo = new bazolib(serverURL);
      return bazo.createAndSubmitTransaction(0, 9, 1, nonRootPubKey1, nonRootPubKey2, nonRootPrivKey1)
      .then((res) => {
          assert(res)
      })
    });
    it('should not be possible to create and sign a transaction with missing arguments', function() {
      var bazo = new bazolib(serverURL);
      return bazo.createAndSubmitTransaction(0, 9, 1, nonRootPubKey1, nonRootPubKey2)
      .then((res)=> {
          assert(res)
      })
      .catch((err) => {
        assert(true)
      })
    });
  });

});
