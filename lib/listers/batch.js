"use strict";

const _listish = require("./listish");

function _batch$(array, numberAtOnce, proc) {
  const pending = array.slice(); // we're being destructive so work on a copy
  const finished = new Array(array.length);
  const streams = [];

  let index = 0;
  const streamer = () => {
    if (!pending.length) {
      return Promise.resolve();
    }

    const item = pending.shift();
    const mine = index;
    index += 1;
    return Promise.resolve(proc(item)).then(result => (finished[mine] = result)).then(streamer);
  };

  for (let i = 0; i < numberAtOnce; i++) {
    streams.push(Promise.resolve().then(streamer));
  }

  return Promise.all(streams).then(() => finished);
}

function batch(listish, numberAtOnce, proc) {
  return _listish(listish, array => _batch$(array, numberAtOnce, proc));
}

module.exports = batch;
