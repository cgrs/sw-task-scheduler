# `ServiceWorker` task scheduler

This is a proof of concept of a task scheduler inside a ServiceWorker.

## How?

The Service Worker has a non-blocking infinite loop (using `setInterval`) constantly checking in a task ~~queue~~ `Set` whether the due date arrives and runs the task.

When a user sends a `task` message to the service worker:
1. It adds the task to a list of pending tasks
2. Then the worker compares the scheduled date of the task against a `Date` object with the actual date
3. If dates match, the task is run and a notification is shown 
4. The task is added to a `Set` of done tasks (to keep track of already done tasks)

## Preview

```bash
$ git clone https://github.com/cgrs/sw-task-scheduler.git
$ cd sw-task-scheduler
$ # run a web server at project root
$ # for Python 2.x
$ python -m SimpleHTTPServer
$ # for Python 3.x
$ python3 -m http.server
$ # for node
$ http-server # npm i -g http-server
```