importScripts('./src/task.js')
importScripts('/__/firebase/5.0.0/firebase-app.js')
importScripts('/__/firebase/5.0.0/firebase-messaging.js')
importScripts('/__/firebase/5.0.0/firebase-functions.js')
importScripts('/__/firebase/5.0.0/firebase-database.js')
importScripts('/__/firebase/init.js')

const messaging = firebase.messaging(),
    functions = firebase.functions(),
    database = firebase.database()

messaging.setBackgroundMessageHandler(payload => {
    console.log('message', payload, 'received')
    return self.registration.showNotification('received!')
})

let pendingTasks, doneTasks

self.addEventListener('install', event => {
    pendingTasks = new Set()
    doneTasks = new Set()
    event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim())

    setInterval(function () {
        if (pendingTasks.size !== 0) {
            for (let task of pendingTasks) {
                if (!task.done && new Date(task.date).getTime() <= new Date().getTime()) {
                    task.run().then(task => {
                        messaging.getToken().then(token => {
                            functions.httpsCallable('sendNotification')({
                                token,
                                notification: {
                                    title: 'yay',
                                    body: 'fcm through firebase functions!'
                                }
                            })
                            console.log(task, `has run`)
                        })
                        updateTask(task)
                        doneTasks.add(task)
                        pendingTasks.delete(task)
                    })
                }
            }
        }
    }, 0)
})

self.addEventListener('message', event => {
    const task = Object.assign(new Task(), event.data.task)
    pendingTasks.add(task)
    console.log(`task`, task, `added`)
})

self.addEventListener('notificationclose', event => {
    console.log(event.notification, `was closed`)
})

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.matchAll({
        type: 'window'
    }).then(clientList => {
        clientList.filter(client => client.url === '/' && 'focus' in client).map(client => client.focus())
        if (clients.openWindow) return clients.openWindow('/')
    }))
})

database.ref('/events').orderByChild('date').on('child_added', newEvent => {
    console.log(`new child added`)
    pendingTasks.add(Object.assign(new Task(), newEvent.val()))
})

function updateTask(task) {
    database.ref('/events').once('value').then(snapshot => {
        let values = snapshot.val()
        for (let key in values) {
            if (!values[key].done && new Date(task.date).getTime() === new Date(values[key].date).getTime()) {
                values[key].done = true
                database.ref(`/events/${key}`).set(values[key])
            }
        }
    })
}