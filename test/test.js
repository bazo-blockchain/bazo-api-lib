var assert = require('assert');
var bazolib = require('../index.js');

/*
* Set these variables up at the start!
*/
const serverURL = 'https://fc6cbb95.ngrok.io/';
const rootPubKey = '';
const nonRootPubKey1 = 'dedb0e69150a68503fedfb4f79a462a6da751df9134705ebab941266e9b7854adae4cb8cef04d9538b31263e5eb71ff6af439cde04a28136d8a89a02bbed752f';
const nonRootPubKey2 = '';
const nonRootPubKey3 = '';
const nonRootPubKey4 = '';

describe('Bazo lib', function() {
  describe('constructor', function() {
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
  describe('account state', function() {
    it('should return a correctly formatted object', function() {
      var bazo = new bazolib(serverURL);
      return bazo.getAccountInfo(nonRootPubKey1).then(function(data){
        assert(data != null)
        console.log(data);
      });
    });
  });
  describe('FundsTx', function() {
    it('should return a correct hash', function() {
      var bazo = new bazolib(serverURL);
      return bazo.getTransactionHash(0, 10, 1, 1, nonRootPubKey1, nonRootPubKey2).then(function(data){
        assert(data != null)
        console.log(data);
      });
    });
  });

});
