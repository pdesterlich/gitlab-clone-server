'use strict';

var commandLineArgs = require('command-line-args');

var cli = commandLineArgs([
  { name: 'source-url', type: String, defaultValue: process.env.GITLAB_CLONE_SOURCE_URL },
  { name: 'source-key', type: String, defaultValue: process.env.GITLAB_CLONE_SOURCE_KEY },
  { name: 'dest-url', type: String, defaultValue: process.env.GITLAB_CLONE_DEST_URL },
  { name: 'dest-key', type: String, defaultValue: process.env.GITLAB_CLONE_DEST_KEY },
  { name: 'local-path', type: String, defaultValue: 'repositories' }
]);

var options = cli.parse();

console.log("gitlab-clone-server");
console.log("-----");
console.log("source: " + options['source-url']);
console.log("dest  : " + options['dest-url']);
console.log("-----");

var source = require('gitlab')({ url: options['source-url'], token: options['source-key'] });

source.projects.all(function (list) {
  list = list.map(function (item) {
    return {
      group: item.namespace.name,
      name: item.name,
      description: item.description,
      path: item.namespace.name + '/' + item.name
    };
  }).sort(function (a,b) {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
  });
  list.forEach(function (project) {
    console.log(project.path);
  });
});
