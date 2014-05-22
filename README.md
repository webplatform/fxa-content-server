# WebPlatform.org Accounts Content Server

Based off of Mozilla Firefox Accounts server. This project constrantly rebases from either master branch with our own customizations on top of theirs.

Static server that hosts Firefox Account sign up, sign in, email verification, etc. flows.

## Prerequisites

* node 0.10.x or higher
* npm
* Grunt (`npm install -g grunt-cli`)
* PhantomJS (`npm install -g phantomjs`)
* bower (`npm install -g bower`)
* libgmp
  * On Linux: install libgmp and libgmp-dev packages
  * On Mac OS X: brew install gmp
* [fxa-auth-server](https://github.com/mozilla/fxa-auth-server) running on 127.0.0.1:9000.

## Development Setup

```
cp server/config/local.json-dist server/config/local.json
npm install
npm start
```

It will listen on <http://127.0.0.1:3030> by default.

## Testing

### Setup
There is quite a bit of setup to do before you can test this service, which is non-optimal, but for now:

  * Set up saucelabs credentials (we have an opensource account: `SAUCE_USERNAME=fxa-content` `SAUCE_ACCESS_KEY=ee5354a4-3d5e-47a0-84b0-0b7aaa12a720`)
  * PhantomJS: `phantomjs --webdriver=4444` (see [Prerequisites](#prerequisites))
  * Run the Firefox Content Server locally: `npm start`
  * Run an instance of the [fxa-auth-server](https://github.com/mozilla/fxa-auth-server) at 127.0.0.1:9000.

e.g. in shell form:

```
export SAUCE_USERNAME=fxa-content
export SAUCE_ACCESS_KEY=ee5354a4-3d5e-47a0-84b0-0b7aaa12a720
phantomjs --webdriver=4444 &
cd fxa-auth-server
npm start &
cd ../fxa-content-server
npm start &
```

### Running the tests

To run tests locally against phantomjs:

    npm test

To run tests against saucelabs:

    npm run-script test-remote

### Advanced local testing using headed browsers

It is possible to run the Selenium tests against local browsers like Firefox, Chrome, and Safari.

#### Prerequisites:

  * Java JDK or JRE (http://www.oracle.com/technetwork/java/javase/downloads/index.html)
  * Selenium Server (http://docs.seleniumhq.org/download/)

#### Configuration:

  * edit `tests/intern.js` to select the browsers to test under `environments`.
  * comment out `phantom`

#### Running the tests

  * Start the Selenium Server: `java -jar selenium-server-standalone-2.38.0.jar`
  * Stop PhantomJS if it is running.
  * from the `fxa-content-server` directory, type `npm test`

### Development setup

#### Working on content

    bower update
    grunt copy:strings
    grunt po2json
    grunt serverproc:dev

## Configuration

The default auth server is `http://api-accounts.dev.lcip.org`.  To change this,
edit `server/config/*.json` on your deployed instance.

    {
      'fxaccount_url': 'http://your.auth.server.here.org'
    }


## Grunt Commands

[Grunt](http://gruntjs.com/) is used to run common tasks to build, test, and run local servers.

* `grunt jshint` - run JSHint on client side and testing JavaScript.
* `grunt build` - build production resources.
* `grunt clean` - remove any built production resources.
* `grunt test` - run local Intern tests.
* `grunt server` - run a local server running on port 3030 with development resources.
* `grunt server:dist` - run a local server running on port 3030 with production resources. Production resources will be built as part of the task.
* `grunt version` - stamp a new minor version. Updates the version number and creates a new CHANGELOG.md
* `grunt version:patch` - stamp a new patch version. Updates the version number and creates a new CHANGELOG.md

## Servers

* latest development - https://accounts-latest.dev.lcip.org/
* testing - https://accounts.dev.lcip.org/
* stage - https://accounts.stage.mozaws.net/
* production - https://accounts.firefox.com/

## License

MPL 2.0
