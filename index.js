'use strict';

var _ = require('lodash');
var childProcess = require('child_process');
var async = require('async');
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

var processProject = function(project, callback) {
  var command = '';
  console.log("-----");
  console.log((project.destExist ? chalk.blue('aggiorno') : chalk.green('creo')) + ' ' + project.path);
  var fullPath = path.join(__dirname, options['local-path'], project.group, project.name);
  mkdirp(fullPath, function (err, made) {
    var isNewLocal = (made ? true : false);

    command = isNewLocal ? 'git clone --mirror ' + project.url + ' .' : 'git remote update';
    childProcess.execSync(command, { cwd: fullPath });

    if (project.destExist) {
      // il progetto esiste nel server di destinazione, mi limito ad aggiornarlo
      command = 'git push --mirror ' + project.destUrl;
      childProcess.execSync(command, { cwd: fullPath });
    } else {
      // il progetto non esiste nel server di destinazione, lo creo
      //
      // TODO
      // se il progetto è personal (project.isPersonal === true):
      // verifico se l'utente esiste, se non esiste aggiungo l'utente, poi aggiungo il progetto e faccio il push
      // se il progetto è di gruppo (project.isPersonal === false):
      // verifico se il gruppo esiste, se non esiste aggiungo il gruppo, poi aggiungo il progetto e faccio il push
    }

    callback();
  });
};

source.projects.all(function (sourceList) {
  dest.projects.all(function (destList) {
    sourceList = cleanRepoList(sourceList);
    destList = cleanRepoList(destList);

    sourceList.forEach(function (sourceProject) {
      var destProject = _.find(destList, { path: sourceProject.path });
      sourceProject.destExist = (destProject) ? true : false;
      sourceProject.destUrl = (destProject) ? destProject.url : '';
      sourceProject.isPersonal = (sourceProject.owner) ? true : false;
    });

    async.eachSeries(sourceList, processProject, function (err) {
      if (err) {
        console.log(chalk.red('ERRORE'));
        console.log(err);
        process.exit(1);
      }
      console.log('-----');
      process.exit(0);
    });
  });
});
