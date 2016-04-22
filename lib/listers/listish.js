'use strict';

const util = require('util');

const isPromise = require('../utilities').isPromise;
const isArray = thingy => Array.isArray(thingy);
const isArrayIsh = thingy => (Symbol.iterator in thingy ||
  ('length' in thingy && typeof thingy.length === 'number' &&
  '0' in thingy && (thingy.length === 0 || (thingy.length - 1) in thingy)));
const isObject = thingy => (thingy instanceof Object &&
  Object.prototype.toString === thingy.toString());

const fromPromise = (thingy, func) => thingy.then(res => listish(res, func));
const fromArray = (thingy, func) => func(thingy);
const fromArrayIsh = (thingy, func) => func(Array.from(thingy));
const fromObject = (thingy, func) => {
  const keys = Object.keys(thingy);
  const values = keys.map(key => thingy[key]);
  const reducer = (obj, item, index) => {
    obj[keys[index]] = item;
    return obj;
  };

  return action(values).then(results => results.reduce(reducer, {}));
};

const transforms = [
  [isArray, fromArray],
  [isArrayIsh, fromArrayIsh],
  [isPromise, fromPromise],
  [isObject, fromObject],
];

function complain(thingy, action) {
  const whateverThisThingIs = util.inspect(thingy);
  const iDontEvenWantToKnow = util.inspect(action);
  const complaint = ('listish expects arguments (thingy, func) ' +
    `but received (${whateverThisThingIs}, ${iDontEvenWantToKnow})`);
  return new Error(complaint);
}

function listish(thingy, action) {
  if (!thingy || typeof action !== 'function') {
    throw complain(thingy, action);
  }

  // if it matches any of our transforms, use the transform
  for (let t of transforms) {
    const test = t[0];
    const transform = t[1];
    if (test(thingy)) return transform(thingy, action);
  }

  throw complain(thingy, action);
}

module.exports = listish;
