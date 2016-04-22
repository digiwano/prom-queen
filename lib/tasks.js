'use strict';

function tasks(initialState, taskArray) {
  if (Array.isArray(initialState)) {
    tasks = initialState;
    initialState = null;
  }

  if (!Array.isArray(tasks) || taskArray.length === 0) {
    throw new Error('No tasks passed to .tasks()!');
  }

  const opts = options(Array.from(arguments));
  const state = setupState(initialState);
  const reducer = (p, task) => p.then(() => (Array.isArray(task) ?
    Promise.all(task.map(t => t(state))) :
    task(state)));
  return taskArray.reduce(reducer, Promise.resolve()).then(() => state);
}

function setupState(initialState) {
  const state = Object.assign({}, initialState);
  Object.defineProperty(state, 'set', {
    enumerable: false,
    configurable: false,
    writable: false,

    value: key => value => {
      state[key] = value;
      return Promise.resolve();
    },
  });
  return state;
}

module.exports = {
  tasks,
};
