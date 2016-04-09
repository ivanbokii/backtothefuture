Low battery events
===============
This repo. contains an implementation of a server that receives low battery events through an HTTP API and shows them on a dashboard. The other part of this repo. is a test client that can send low battery events to the server.

You can find deployed version of this project here: http://b2m.ivanbokii.com. It uses a special client that sends data in 
random intervals - from 1 second to 10 minutes.

Installation
----------------
```bash
1. git clone git@github.com:ivanbokii/backtothefuture.git
2. cd backtothefuture
3. npm install
```

Tests
-------
```bash
# all tests
npm test
# back-end tests
npm run backend-test
# front-end tests (Uses Chrome browser)
npm run frontend-test
# client tests
npm run client-test
```
Not all code is covered with tests. In particular - server routing layer is not covered at all and front-end code is partially covered.

Run
-----
```bash
# run server
npm run start-server
# run client in chatty mode
npm run start-chatty-client
```
After running the server and the client, navigate to *http://localhost:8080* to open the dashboard. Dashboard polls data from the server every 5 seconds.

Implementation details
---------------------------------
Server is built with hapi.js and additional plugins for serving static files and validation.  No modern front-end frameworks are used for the front-end code. It was a conscious decision since dashboard is a trivial piece of functionality and full-featured framework usage would be an overkill in this particular case.

To minimize work, front-end code that initialises charts for the last 7 days uses the same API as the code for getting data for only one day. This is an inefficiency that should be removed in case of scaling the back-end to support more web users. Same consideration should be applied to the mechanism of fetching updates from the server since current version uses a simple timer and HTTP requests. There are multiple solutions to this problem and I would prefer to use push notifications for this piece of functionality.
