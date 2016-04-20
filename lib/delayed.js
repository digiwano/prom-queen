'use strict';

const delayed = (ms, arg) => new Promise(resolve => setTimeout(resolve, ms, arg));

module.exports = delayed;
