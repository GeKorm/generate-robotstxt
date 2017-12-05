#!/usr/bin/env node
"use strict";

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _meow = require("meow");

var _meow2 = _interopRequireDefault(_meow);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _resolveFrom = require("resolve-from");

var _resolveFrom2 = _interopRequireDefault(_resolveFrom);

var _standalone = require("./standalone");

var _standalone2 = _interopRequireDefault(_standalone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cli = (0, _meow2.default)(`
    Usage generate-robotstxt [options] <dest>

    Options:
       --config  Path to a specific configuration file.
`, {
  flags: {
    config: {
      type: "string"
    }
  }
});

var optionsBase = {};

if (cli.flags.config) {
  // Should check these possibilities:
  //   a. name of a node_module
  //   b. absolute path
  //   c. relative path relative to `process.cwd()`.
  // If none of the above work, we'll try a relative path starting
  // in `process.cwd()`.
  optionsBase.configFile = (0, _resolveFrom2.default)(process.cwd(), cli.flags.config) || _path2.default.join(process.cwd(), cli.flags.config);
}

Promise.resolve().then(function () {
  return Object.assign({}, optionsBase);
}).then(function (options) {
  return (0, _standalone2.default)(options);
}).then(function (output) {
  if (cli.input.length === 0) {
    throw new Error("Require `dest` argument");
  }

  var dest = _path2.default.resolve(cli.input.pop());

  return Promise.resolve().then(function () {
    return _fsExtra2.default.outputFile(dest, output);
  });
}).catch(function (error) {
  console.log(error); // eslint-disable-line no-console
  process.exit(error.code || 1); // eslint-disable-line no-process-exit
});