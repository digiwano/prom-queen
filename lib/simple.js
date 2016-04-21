'use strict';

module.exports = {
  delayed: (ms, arg) => new Promise(resolve => setTimeout(resolve, ms, arg)),
  cb: (ok, fail) => (err, res) => (err ? fail : ok)(err || res),
  log: msg => result => {
    console.log(msg, result);
    return result;
  },

  isPromise(thingy) {
    if (!thingy) return false;
    if (thingy instanceof Promise) return true;
    if ('then' in thingy && typeof thingy.then === 'function') return true;
    return false;
  },
};
