module.exports = function (shipit) {
    require('shipit-deploy')(shipit);
    require('shipit-bower')(shipit);
    require('shipit-npm')(shipit);
    require('shipit-submodule')(shipit);

    shipit.blTask('grunt:all', function() {
        return shipit.local('grunt all', {cwd: shipit.config.workspace});
    });

    shipit.blTask('load:current', function() {
        return current = '' + shipit.config.currentPath + '';
    });

    shipit.on('submodule:update', function(){
        shipit.start('grunt:all');
    });

    shipit.on('deploy:update', function(){
        shipit.start('load:current');
    });

    shipit.initConfig({
        default: {
            npm: {
                remote: false
            },
            bower: {
                remote: false
            },
            workspace: 'shipit-build',
            deployTo: '/path/to/server',
            currentPath: 'votre-document-root',
            releasesPath: 'votre-document-root/releases',
            repositoryUrl: 'git@github.com:wolters-kluwer-france/le-repo-de-votre-projet.git',
            ignores: [
                '.git',
                'bower_components',
                'node_modules'
            ],
            keepReleases: 2,
            shallowClone: true,
            deleteOnRollback: false,
            branch: 'release/**',
            submodules: true,
            key: 'path/to/key'
        },
        staging: {
            servers: 'user@serverUrl:port'
        }
    });
};
