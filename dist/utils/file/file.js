goog.provide('DD.utils.file');

DD.utils.file.read = function(file, opt_defaultValue) {

  var promise = new Promise(function (resolve, reject) {

    if (!goog.isObject(file))
      return reject('Not an object.');

    if (!(file instanceof File)) {
      if (file instanceof HTMLInputElement && file.files.length)
        file = file.files[0];
      else
        return reject('Not a file object.');
    }

    var reader = new FileReader();
    reader.addEventListener('load', function(event) {
      var value = event.target.result;
      resolve(value);
      reader = null;
    }.bind(this));
    reader.readAsText(file);
  }.bind(this));

  if (opt_defaultValue !== undefined)
    return promise.catch(function () {
      return opt_defaultValue;
    });

  return promise;
};

DD.utils.file.create = function() {
  // ...
  /*

  var A = new Blob(['<p>!!!</p>'], {type: 'text/html'});
  a.href = URL.createObjectURL(A);

  var B = new File([A], 'test');
  //ajax.append(B, 'filename');

  */
};