'use strict';

const _listish = require('./listish');

const _parallel$ = (array, proc) => Promise.all(array.map(item => proc(item)));
const parallel = (listish, proc) => _listish(listish, array => _parallel$(array, proc));

module.exports = parallel;
