'use strict';

const utilities = module.exports = {
  delayed: (ms, arg) => new Promise(resolve => setTimeout(resolve, ms, arg)),

  cb: (ok, fail) => (err, res) => (err ? fail : ok)(err || res),

  adapt: fn => new Promise((ok, fail) => fn(utilities.cb(ok, fail))),

  call: (object, method, args) => new Promise((resolve, reject) => {
    args = args.slice();
    args.push(utilities.cb(resolve, reject));
    object[method].apply(object, args);
  }),

  log: msg => result => {
    console.log(msg, result);
    return result;
  },

  isPromise: (thingy => (!thingy) ? false :
    (thingy instanceof Promise) ? true :
      ('then' in thingy && typeof thingy.then === 'function') ? true :
        false),
};
