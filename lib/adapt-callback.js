'use strict';

const adaptCallback = (resolve, reject) => (error, result) => (error ? reject : resolve)(error || result);

module.exports = adaptCallback;
