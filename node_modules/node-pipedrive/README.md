# node-pipedrive

[![Build](https://travis-ci.org/bookbottles/node-pipedrive.svg)](https://travis-ci.org/bookbottles/node-pipedrive)


Summary
=======
A node.js library for communicating with [Pipedrive's](http://www.pipedrive.com/) REST API.

# Example

```javascript
var pipeClient = require('node-pipedrive')('my_api_key');

pipeClient
    .saveDeal('My New Deal')
    .then(function(id) {
        console.log('Create deal with ID: ' + id);
    }, function(error) {
        console.error('Encountered error: ' + error);
    });
```
