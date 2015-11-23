'use strict';

var commandLineArgs = require('command-line-args');

var cli = commandLineArgs([
  { name: 'source-url', type: String },
  { name: 'source-key', type: String },
  { name: 'dest-url', type: String },
  { name: 'dest-key', type: String },
  { name: 'local-path', type: String, defaultValue: 'repositories' }
]);

var options = cli.parse();

console.log(options);
