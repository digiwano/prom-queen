"use strict";

const _listish = require("./listish");

function _sequential$(array, proc) {
  const results = [];
  const push = x => results.push(x);
  const run = item => () => Promise.resolve(proc(item)).then(push);
  const reducer = (promise, item) => promise.then(run(item));
  return array.reduce(reducer, Promise.resolve()).then(() => results);
}

function sequential(listish, proc) {
  return _listish(listish, array => _sequential$(array, proc));
}

module.exports = sequential;
