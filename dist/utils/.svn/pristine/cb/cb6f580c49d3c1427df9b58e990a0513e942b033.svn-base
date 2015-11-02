goog.provide('DD.utils.ajax');

DD.utils.ajax.get = function(url) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.onload = function(event) {
      if (request.status == 200)
        resolve(this.response);
      else
        reject(this.statusText);
    };
    request.send();
  });
};

DD.utils.ajax.getJSON = function(url) {
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.onload = function(event) {
      if (request.status == 200) {
        try {
          var result = JSON.parse(this.response);
          resolve(result);
        } catch(err) {
          reject(err);
        }
      } else {
        reject(this.statusText);
      }
    };
    request.send();
  });
};