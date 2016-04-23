'use strict';

module.exports = {
  delayed: (ms, arg) => new Promise(resolve => setTimeout(resolve, ms, arg)),
  cb: (ok, fail) => (err, res) => (err ? fail : ok)(err || res),

  log: msg => result => {
    console.log(msg, result);
    return result;
  },

  isPromise: (thingy => (!thingy) ? false :
    (thingy instanceof Promise) ? true :
      ('then' in thingy && typeof thingy.then === 'function') ? true :
        false)
};
