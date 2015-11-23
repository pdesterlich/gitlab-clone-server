# gitlab-clone-server
node script to clone repositories from one gitlab server to another

The script loop through all source repositories, clones them locally (via `git clone --mirror repo`) and push them to dest (via `git push --mirror repo`).

Repositories are automatically created if not existing on dest server.

Each api keys must have complete access to its server.

## usage

node index [params]

### params

param | description | default
----------|-------------|--------
**--source-url** | gitlab origin server url |
**--source-key** | gitlab origin server api key |
**--dest-url** | gitlab dest server url |
**--dest-key** | gitlab dest server api key |
**--local-path** | local path for repositories mirror | repositories
