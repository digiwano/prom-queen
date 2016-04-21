'use strict';

const _yes = () => true;
const _no = () => false;
const _err = c => new Error(`i don't know how to repeat things ${c} times`);

// takes a condition of unknown type and coerces it to a function
function conditionFunc(condition) {
  const type = typeof condition;

  if (type === 'function') {
    return condition;
  }

  const is = x => condition === x;

  // handle true/false
  if (type === 'boolean') {
    return () => !!condition;
  }

  // strings are converted to ints
  if (type === 'string') {
    const c = parseInt(condition, 10) || 0;
    return () => c;
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
  if (arguments.length === 1) {
    proc = condition;
    condition = Infinity;
  }

  condition = conditionFunc(condition);
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

function skipFirst(condition) {
  condition = conditionFunc(condition);
  let first = false;
  const wrapper = () => {
    if (!first) return first = true;
    return condition();
  };

  return wrapper;
}

function negate(condition) {
  condition = conditionFunc(condition);
  return () => !condition();
}

function repeatWhile(condition, proc, opts) {
  opts = (opts || {});
  condition = conditionFunc(condition);
  const cond = (opts.post || opts.postCondition) ? skipFirst(condition) : condition;
  return repeat(cond, proc);
}

function repeatUntil(condition, proc, opts) {
  opts = (opts || {});
  condition = negate(conditionFunc(condition));
  const cond = (opts.post || opts.postCondition) ? skipFirst(condition) : condition;
  return repeat(cond, proc);
}

function infinite(proc) {
  return repeat(Infinity, proc);
}

module.exports = {
  repeat,
  repeatWhile,
  repeatUntil,
  infinite,
};
