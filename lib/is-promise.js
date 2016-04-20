'use strict';

const isPromise = thingy => {
  if (!thingy) return false;
  if (thingy instanceof Promise) return true;
  if ('then' in thingy && typeof thingy.then === 'function') return true;
  return false;
};

module.exports = isPromise;
