## prom-queen

### Lightweight promise utility toolkit fit for royalty

prom-queen provides a number of small helper utilities to make working in a promise-based environment more pleasant. It has no external dependencies and is built for recent/modern javascript platforms.

### environments

In order to meet the goal of zero extra dependencies yet remaining lightweight, this assumes a modern javascript environment exists -- In particular, this library makes no effort to support environments without a native promise implementation, arrow functions, and a few other ES6-y things.

All ES6 features used in this library are supported under Node 4.x LTS; babel should not be required for running under a recent node platform. No node-specific features are used other than that, so a babel+browserify/webpack type situation should work for running in a browser, though this has not yet been tested.


## On _listish_ and _proc_

This documentation refers often to a _listish_. A listish thingy is either an array or an object that can be either treated as or transformed to/from an array. Currently supported listish thingies:

  * a regular javascript Array
  * any javascript [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) (has a `object[Symbol.iterator]()` method which returns an iterator)
  * an array-like object (has .length with type number, has keys `0` and if length != 0, `obj.length - 1`)
  * a regular javascript Object: transformed into an array for processing, transformed back into an object when resolved
  * a promise: any promise passed as a _listish_ is assumed to eventually resolve to a _listish_

Many of `prom-queen`'s utils take a `proc` argument, which is a function reference. This proc function should always return a promise in some way.

## api

### _listish_ utilities:

These take all take arguments of `(listish, proc)`, and all are comparable to a promise-based map or forEach -- they run all items within the `listish` using `proc`, which is a function that takes a single element from the `listish` and must return a promise.

##### `queen.parallel(listish, proc)` ⇒ `Promise`
  * runs `proc(item)` on all items in parallel, roughly equivalent to `Promise.all()`, except it takes a listish while `Promise.all()` only takes an iterable

##### `queen.sequential(listish, proc)` ⇒ `Promise`
  * runs `proc(item)` on all items in series, waiting for `proc(item)` to resolve before continuing to the next.

##### `queen.batch(listish, num, proc)` ⇒ `Promise`
  * `num` must be an integer > 1
  * creates `num` worker promises, running them in parallel. whenever any worker finishes its task, it queues up the next available item on the `listish` to run again.

### repeater utilities:

The repeater utilities are all various ways of running a single `proc` function more than once. In all of the repeater utilities:
  * `proc` is called without any arguments
  * anytime a function is passed as `condition`, this condition function is also called without any arguments
  * anytime `proc` rejects, the repeater will also immediately reject, propagating the original error

##### `queen.repeat(condition, proc)` ⇒ `Promise`
This is the most generic form of `.repeat()` and the core of all the other repeater utilities in prom-queen.
`condition` should be a function that takes no arguments and returns a boolean. It's roughly equivalent to `while (condition()) { proc(); }`. If `condition()` or `proc()` ever rejects, `repeat` will reject immediately. If `condition()` ever returns a non-truthy value, the `repeat` will immediately resolve with an array containing the results from every iteration so far.

##### `queen.repeat(number, proc)` ⇒ `Promise`

In this form, `proc` will be invoked exactly `number` times (unless any invocation rejects, in which case execution will immediately stop).

##### `queen.repeat(Infinity, proc)` ⇒ `Promise`
##### `queen.repeat(proc)` ⇒ `Promise`
##### `queen.infinite(proc)` ⇒ `Promise`

These are all aliases for `queen.repeat(() => true, proc)`. This is an infinite asynchronous loop which only exits if `proc()` ever rejects. In this case `repeat` will also reject, propagating the error.

##### `queen.repeatWhile(condition, proc, opts)` ⇒ `Promise`

Apart from `opts`, this is a synonym for `queen.repeat(condition, proc)` -- `proc` will execute repeatedly until `condition()` resolves to a non-truthy value. If `opts.postCondition` (or its alias `opts.post`) is defined and truthy then the first call to condition() is skipped; this makes `queen.repeat(condition, proc)` and `queen.repeat(condition, proc, {post:false})` equivalent to `while (condition()) { proc() }`, while `queen.repeat(condition, proc, {post:true})` is equivalent to `do { proc() } while (condition());`.

##### `queen.repeatUntil(condition, proc, opts)` ⇒ `Promise`
The same as `queen.repeatWhile()` except with its condition negated; proc will execute repeatedly until `condition()` resolves to a truthy value

### task runner utilities:

##### `queen.tasks(initialState, taskArray)` ⇒ `Promise`
##### `queen.tasks(taskArray)` ⇒ `Promise`

`queen.tasks` is a convenient way to run a handful of `task` functions in order, each of which will be called with a shared `state` object where they can store results and other data, and each of which should return a promise. `queen.tasks()` resolves with the final state after all of the tasks have run.

If any entry in `taskArray` is itself an array, it is assumed to be an array of `task` functions, which will be run in parallel.

The `state` object has one extra (non enumerable/writable/configurable) property called `set`; this is a small helper for setting things into the state. `somePromise.then(state.set('myResult'))` is equivalent to `somePromise.then(result => {state.myResult = result; })`


A small example:

```javascript
  queen.tasks([
    state => User.find({email:'someone@somedomain.com'}).then(state.set('user'))
    [
      state => Posts.count({user:state.user.id}).then(state.set('posts')),
      state => Comments.count({user:state.user.id}).then(state.set('comments')),
    ]
  ]).then(results => console.log(results.user, results.posts, results.comments));
```

### helper utilities:

##### `queen.isPromise(thingy)` ⇒ `Boolean`
  * returns `true` if `thingy` seems to be a promise of some sort, either by being `instanceof Promise`, or having a `.then` method

##### `queen.delayed(ms, val)` ⇒ `Promise`
  * returns a promise that resolves with `val` after `ms` milliseconds. Quick hack and available elsewhere but tiny and was useful during prototyping so was left in.

### utilities for dealing with callback apis

##### `queen.cb(resolve, reject)` ⇒ `(error, result) => null`
  * simple util for dealing with callbacks. This transforms a resolve/reject pair into a callback function of (roughly) the form `(error, result) => { if (error) { return reject(error); } return resolve(result); }`
```javascript
    function read(file) {
      return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', queen.cb(resolve, reject));
      });
    }
```

##### `queen.adapt(func) ⇒ `Promise`
  * very light wrapper around `queen.cb()` above, creates a promise and calls the passed function with a callback which triggers the rejection or resolution of the returned promise.
  * used for adapting callback-based code into promises
```javascript

// run a callback-taking function (similar to call below)
queen.adapt(callback => fs.readFile(file, 'utf8', callback)).then(contents => console.log("my contents are", contents));

// wrap a callback-taking function
const _readFile = (fn, opts) => queen.adapt(cb => fs.readFile(fn, opts, cb));
```

##### `queen.call(obj, method, argsArray)` ⇒ `Promise`
  * wraps a single call of a single method in a promise: `queen.call(fs, 'readFile', ['package.json', 'utf8']).then(JSON.parse)`
