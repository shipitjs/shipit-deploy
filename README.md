# WKF shipit-deploy

Set of deployment tasks for [Shipit](https://github.com/shipitjs/shipit) based on git and rsync commands.

**Features:**

- Deploy tag, branch or commit
- Add additional behaviour using hooks
- Build your project locally or remotely
- Easy rollback

## Install

Pour installer la version spécifique de shipit-deploy à Wkf, vous devez :

Copier coller les fichiers suivants à la racine de votre projet:

[bower.json](https://github.com/wolters-kluwer-france/shipit-deploy/wkf/bower.json)
[Gruntfile.js](https://github.com/wolters-kluwer-france/shipit-deploy/wkf/Gruntfile.js)
[package.json](https://github.com/wolters-kluwer-france/shipit-deploy/wkf/package.json)
[shipitfile.js](https://github.com/wolters-kluwer-france/shipit-deploy/wkf/shipitfile.js)

Vous devez alors adapter le fichier de configuration `shipitfile.js` à vos besoins.

Executez ensuite 

``bash
$ npm install
$ grunt all
`̀

## Usage

Pour le déploiement, 

```bash
shipit staging deploy
```

Pour annuler le dernier déploiement, 

```bash
shipit staging rollback
```


### Instruction détaillées

Accéder aux instructions d'[installation spécifiques](https://github.com/wolters-kluwer-france/INSTALL.md) du module.