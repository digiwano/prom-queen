'use strict';

const isPromise = require('./is-promise');
const toPromise = thingy => isPromise(thingy) ? thingy : Promise.resolve(thingy);

module.exports = toPromise;
