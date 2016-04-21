'use strict';

const simple = require('./lib/simple');
const repeaters = require('./lib/simple');

module.exports = Object.assign({
  sequential: require('./lib/sequential'),
  parallel: require('./lib/parallel'),
  batch: require('./lib/batch'),
}, repeaters, simple);
