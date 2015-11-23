'use strict';

var _ = require('lodash');
var path = require('path');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var commandLineArgs = require('command-line-args');

var cli = commandLineArgs([
  { name: 'source-url', type: String, defaultValue: process.env.GITLAB_CLONE_SOURCE_URL },
  { name: 'source-key', type: String, defaultValue: process.env.GITLAB_CLONE_SOURCE_KEY },
  { name: 'dest-url', type: String, defaultValue: process.env.GITLAB_CLONE_DEST_URL },
  { name: 'dest-key', type: String, defaultValue: process.env.GITLAB_CLONE_DEST_KEY },
  { name: 'local-path', type: String, defaultValue: 'repositories' },
  { name: 'project', type: String, defaultValue: '' },
  { name: 'group', type: String, defaultValue: '' }
]);

var options = cli.parse();

console.log("gitlab-clone-server");
console.log("-----");
console.log("source: " + options['source-url']);
console.log("dest  : " + options['dest-url']);
console.log("-----");

var source = require('gitlab')({ url: options['source-url'], token: options['source-key'] });
var dest = require('gitlab')({ url: options['dest-url'], token: options['dest-key'] });

var cleanRepoList = function (list) {
  return list.map(function (item) {
    return {
      group: item.namespace.name,
      name: item.name,
      description: item.description,
      path: item.namespace.name + '/' + item.name,
      url: item.ssh_url_to_repo
    };
  }).filter(function (item) {
    return ((options.project === '') || (options.project === item.name)) && ((options.group === '') || (options.group === item.group));
  }).sort(function (a,b) {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
  });
};

source.projects.all(function (sourceList) {
  dest.projects.all(function (destList) {
    sourceList = cleanRepoList(sourceList);
    destList = cleanRepoList(destList);

    sourceList.forEach(function (sourceProject) {
      var fullPath = path.join(options['local-path'], sourceProject.group, sourceProject.name);
      mkdirp(fullPath);

      if (_.find(destList, { path: sourceProject.path })) {
        console.log(chalk.blue(sourceProject.path));
      } else {
        console.log(chalk.green(sourceProject.path));
      }
    });
  });
});
