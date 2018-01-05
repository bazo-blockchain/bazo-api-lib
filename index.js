const axios = require('axios');
class Bazojs {
  constructor(serverAddress) {
    this.serverAddress = serverAddress || 'http://localhost:8001';
  }
  getAccountInfo(publicKey) {
    let that = this;
    return new Promise(function(resolve, reject) {
      axios.get(that.formatAccountRequest(publicKey))
      .then((res) => {
        if (!that.responseWasSuccessfull(res.data)) {
          reject();
        }
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }
  getTransactionHash(header=0, amount, fee, txCount, sender, recipient){
    let that = this;
    return new Promise(function(resolve, reject) {
      console.log(that.formatTxHashRequest(header, amount, fee, txCount, sender, recipient));
      axios.post(that.formatTxHashRequest(header, amount, fee, txCount, sender, recipient))
      .then((res) => {
        resolve(res.data.content[0].detail);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }
  formatAccountRequest(publicKey) {
    return `${this.formatServerAddress()}account/${publicKey}`;
  }
  formatTxHashRequest(header, amount, fee, txCount, sender, recipient) {
    if (!(amount > 0 && fee > 0 && txCount && sender && recipient)) {
      this.throwArgumentError();
    }
    return `${this.formatServerAddress()}createFundsTx/${header}/${amount}/${fee}/${txCount}/${sender}/${recipient}`;
  }
  formatServerAddress() {
    if (this.serverAddress.slice(-1) !== '/') {
      return `${this.serverAddress}/`;
    } return this.serverAddress;
  }
  responseWasSuccessfull(response) {
    if (response === '') {
      return false;
    }
    if (response.match(/does not exist/)) {
      return false;
    } return true;
  }
}

module.exports = Bazojs;
