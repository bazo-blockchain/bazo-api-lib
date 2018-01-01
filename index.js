const axios = require('axios');
class Bazojs {
  constructor(serverAddress) {
    this.serverAddress = serverAddress || 'http://localhost:8001';
  }
  getAccountInfo(publicKey) {
    let that = this;
    return new Promise(function(resolve, reject) {
      axios.get(that.formatAccountRequest(publicKey)
    ).then((res)=>{
      if (!that.responseWasSuccessfull(res.data)) {
        reject()
      }
      resolve(res.data)
    }).catch(()=>{
      reject()
    })
    });
  }
  formatAccountRequest(publicKey) {
    return `${this.formatServerAddress()}account/${publicKey}`;
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
