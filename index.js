'use strict';

var path = require('path');
var mkdirp = require('mkdirp');
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

var cleanRepoList = function (list) {
  return list.map(function (item) {
    return {
      group: item.namespace.name,
      name: item.name,
      description: item.description,
      path: item.namespace.name + '/' + item.name,
      url: item.ssh_url_to_repo
    };
  }).sort(function (a,b) {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
  });
};

source.projects.all(function (list) {
  list = cleanRepoList(list);
  list.forEach(function (project) {
    var fullPath = path.join(options['local-path'], project.group, project.name);
    console.log(project.path + ' - ' + project.url);
    mkdirp(fullPath);
  });
});
