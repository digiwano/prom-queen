## prom-queen
### Lightweight promise utility toolkit

prom-queen provides a number of small helper utilities to make working in a promise-based environment more pleasant. It has no external dependencies and is built for recent/modern javascript platforms.

### environments

In order to meet the goal of zero extra dependencies yet remaining lightweight, this assumes a modern javascript environment exists -- In particular, this library makes no effort to support environments without a native promise implementation, arrow functions, and a few other ES6 things.

All ES6 features used in this library are supported under Node 4.x LTS; babel should not be required for running under a recent node platform. No node-specific features are used other than that, so babel+browserify should work for running in a browser, though this has not yet been tested.

### api

### on _listish_

This documentation refers often to a _listish_. A listish thingy is either an array or an object that can be either treated as or transformed to/from an array. Currently supported listish thingies:

  * a regular javascript Array
  * any javascript [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) (has a `object[Symbol.iterator]()` method which returns an iterator)
  * an array-like object (has .length with type number, has keys `0` and `obj.length - 1`)
  * a regular javascript Object: transformed into an array for processing, transformed back into an object when resolved
  * a promise: any promise passed as a _listish_ is assumed to eventually resolve to a _listish_

### _listish_ utilities:

These take all take arguments of `(listish, proc)`, and all are comparable to a promise-based map or forEach -- they run all items within the `listish` using `proc`, which is a function that takes a single element from the `listish` and must return a promise.

##### `queen.parallel(listish, proc)`
  * runs `proc(item)` on all items in parallel, roughly equivalent to `Promise.all()`, except it takes a listish while `Promise.all()` only takes an iterable

##### `queen.sequential(listish, proc)`
  * runs `proc(item)` on all items in series, waiting for `proc(item)` to resolve before continuing to the next.

##### `queen.batch(listish, num, proc)`
  * `num` must be an integer > 1
  * creates `num` worker promises, running them in parallel. whenever any worker finishes its task, it queues up the next available item on the `listish` to run again.

### helper utilities:

##### `queen.isPromise(thingy)`
  * returns `true` if `thingy` seems to be a promise of some sort, either by being `instanceof Promise`, or having a `.then` method

##### `queen.delayed(ms, val)`
  * returns a promise that resolves with `val` after `ms` milliseconds. Quick hack and available elsewhere but tiny and was useful during prototyping so was left in.

##### `queen.adaptCallback(resolve, reject)`
  * A lot of promise utility libraries have some convoluted way of turning a callback-based api into, but they all seem awkward. Instead of constructing a promise for you, this helper only takes care of the callback boilerplate, allowing the following pattern:
```javascript
    function read(file) {
      return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', queen.adaptCallback(resolve, reject));
      });
    }
```