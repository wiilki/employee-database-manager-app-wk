[![npm version](https://badge.fury.io/js/simple-banner.svg)](https://badge.fury.io/js/simple-banner)
![Test](https://raw.githubusercontent.com/null4bl3/simple-banner/master/test/badge.svg?sanitize=true)

A simple node.js banner display for the console.

The module displays a optional project name, additional optional extended information as well as the file being run, and the time the process was started.

Aiming for a minimum of requirements by only using the tiny [colors](https://www.npmjs.com/package/colors) npm module.

The module contains a single function named set.
set("app name", "additional info", rainbow boolean)

Either require the module as a variable and use the .set function:

```javascript
let banner = require('simple-banner');
banner.set("The Amazing Application");
```

("The Amazing Application" being the name of your application)

Or you do it all in one line:

```javascript
require('simple-banner').set("The Amazing Application");
```

The module takes two optional parameters besides the application name.
The first is any additional information you wish to display in the banner.
The second is a boolean value that decides if the application title is going to be displayed using the rainbow beauty or not.

![no rainbow option](https://github.com/null4bl3/simple-banner/raw/master/Screenshot2.png)


Should you wish to have the application name utilize the rainbow print function,
simply add a true boolean as the last of three parameter in the function call:

```javascript
require('simple-banner').set("The Amazing Application", "", 1);
```

![rainbow option](https://github.com/null4bl3/simple-banner/raw/master/Screenshot1.png)
