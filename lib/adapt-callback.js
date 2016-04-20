'use strict';

const adaptCallback = (ok, fail) => (e, x) => (e ? fail : ok)(e || x);

module.exports = adaptCallback;
