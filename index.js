'use strict';

const sequential = require('./lib/sequential');
const parallel = require('./lib/parallel');
const batch = require('./lib/batch');
const adaptCallback = require('./lib/adapt-callback');
const delayed = require('./lib/delayed');
const isPromise = require('./lib/is-promise');

module.exports = {
  sequential,
  parallel,
  batch,
  adaptCallback,
  delayed,
  isPromise,
};
