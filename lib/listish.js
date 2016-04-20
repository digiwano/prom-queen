'use strict';

const util = require('util');

const isPromise = require('./is-promise');
const isArray = thingy => Array.isArray(thingy);
const isIterable = thingy => (Symbol.iterator in thingy);

const fromPromise = (thingy, func) => thingy.then(res => listish(res, func));
const fromArray = (thingy, func) => func(thingy);
const fromIterable = (thingy, func) => func(Array.from(thingy));

const transforms = [
  [isArray, fromArray],
  [isIterable, fromIterable],
  [isPromise, fromPromise],
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

  // otherwise, assume it's an object. run the method on its values, then
  // stitch them back to their original keys
  const keys = Object.keys(thingy);
  const values = keys.map(key => thingy[key]);
  const reducer = (obj, item, index) => {
    obj[keys[index]] = item;
    return obj;
  };

  return action(values).then(results => results.reduce(reducer, {}));
}

module.exports = listish;
