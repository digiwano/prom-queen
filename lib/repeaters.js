'use strict';

const _yes = () => true;
const _no = () => false;
const _err = c => new Error(`i don't know how to repeat things ${c} times`);

function _wobbleCondition(condition) {
  const is = x => condition === x;
  const type = typeof condition;

  if (type === 'function') {
    return condition;
  }

  if (type === 'number') {
    if (is(Infinity)) return _yes;
    if (is(0)) return _no;
    if (condition < 0) {
      throw _err(condition);
    }

    // run `condition` times
    let counter = 0;
    return () => ++counter <= condition;
  }

  throw _err(condition);
}

function repeat(condition, proc) {
  condition = _wobbleCondition(condition);
  const _cond = () => Promise.resolve().then(condition);
  const _proc = () => Promise.resolve().then(proc);

  const results = [];
  const repeater = () => _cond().then(go => {
    if (go) {
      return _proc().then(result => results.push(result)).then(repeater);
    }
  });
  return Promise.resolve().then(repeater).then(() => results);
}

function whilst(condition, proc) {
  return repeat(condition, proc);
}

function doWhilst(condition, proc) {
  condition = _wobbleCondition(condition);
  let first = false;
  const cond = () => {
    if (!first) return first = true;
    return condition();
  };

  return repeat(cond, proc);
}

function until(condition, proc) {
  condition = _wobbleCondition(condition);
  const cond = () => !condition();
  return repeat(cond, proc);
}

function doUntil(condition, proc) {
  condition = _wobbleCondition(condition);
  let first = false;
  const cond = () => {
    if (!first) return first = true;
    return !condition();
  };

  return repeat(cond, proc);
}

function forever(proc) {
  return repeat(Infinity, proc);
}

module.exports = {
  repeat,
  forever,
  whilst,
  doWhilst,
  until,
  doUntil,
};
