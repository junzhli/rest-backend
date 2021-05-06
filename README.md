# Backend APIs
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
[Hosted on Heroku](https://glints-node-js-backend.herokuapp.com) 

## Table of Contents
- [Backend APIs](#backend-apis)
  - [Table of Contents](#table-of-contents)
  - [Prerequisite](#prerequisite)
  - [Building](#building)
  - [Run](#run)
  - [Bootstrap database from script](#bootstrap-database-from-script)
  - [Available APIs](#available-apis)
  - [Author](#author)
  - [License](#license)

Prerequisite
-----
* Nodejs >= v12
* Yarn
* ProgresSql >= v13.2 (with extension installed: pg_trgm)

Building
-----

* Build
  
```bash
$ yarn install --frozen-lockfile
```

Run
-----

Before you run this project as follows, env setting may be a necessary:
>>> create a .env file under root project or copy from .env.default
* Environment setting

`DATABASE_URL`: ProgresSql URI (e.g. postgres://user:password@localhost:5432/restDB)  
`DB_SSL`: SSL enabled for ProgresSql, leave it blank to disable SSL mode by default  
`DB_DISABLE_LOGGING`: Disable logging for sql execution statements, leave it blank to enable logging by default  

* For development

Run server in dev mode
```bash
$ yarn start
```

Integration testing & testing unit
```bash
$ yarn test
```

Linting codebase
```bash
$ yarn run lint-fix
```

* For production

```bash
$ yarn run prod
```

Docker build
>>> Before proceed to docker build,  
>>> (1) Select one of options specified in Dockerfile: Heroku, RunAnyWhere  
>>> (2) Set expose port to 8080

```bash
$ docker build -t rest-backend .
```

Bootstrap database from script
-----

```bash
$ yarn run bootstrap-database
```


Available APIs
-----

[See on Swagger](https://glints-node-js-backend.herokuapp.com/api-docs)

Author
-----
Jeremy Li

License
-----
MIT License
