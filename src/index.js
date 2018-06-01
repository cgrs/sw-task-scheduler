if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', {
        scope: '/'
    })
        .then(() => Notification.requestPermission())
        .then(perm => {
            if (perm === 'granted') {
                navigator.serviceWorker.ready.then(swReg => {
                    init()
                    // navigator.serviceWorker.controller.postMessage({
                    //     kind: 'notification',
                    //     notification: {
                    //         title: 'Ready!',
                    //         options: {}
                    //     }
                    // })
                })
            }
        })
}

function init() {
    const button = document.querySelector('button#send'),
        kind = document.querySelector('select#kind'),
        title = document.querySelector('input[name="title"]')
    let options = document.querySelector('#options'),
        container = options.parentElement

    function validate() {
        try {
            return kind.value !== "Kind" && 
                   title.value && 
                   (options.type === 'datetime-local' || options.value === '' || JSON.parse(options.value))
        } catch (error) {
            return false
        }
    }

    function sendMessage() {
        if (!validate()) return
        const message = createMessage()
        navigator.serviceWorker.controller.postMessage(message)
    }

    function createMessage() {
        if (kind.value === 'task') {
            return {
                kind: 'task',
                task: {
                    name: title.value,
                    date: new Date(options.value || Date.now())
                }
            }
        }
        else {
            try {
                return {
                    kind: 'notification',
                    notification: {
                        title: title.value,
                        options: JSON.parse(options.value)
                    }
                }
            } catch (error) {
                return {
                    kind: 'notification',
                    notification: {
                        title: title.value,
                        options: {}
                    }
                }
            }
        }
    }
    
    button.addEventListener('click', sendMessage)

    kind.addEventListener('change', ev => {
        let element = document.createElement((kind.value === 'task')?'input': 'textarea')
        element.id = 'options'
        if (kind.value === 'task') {
            element.type = 'datetime-local'
        }
        else {
            element.setAttribute('placeholder', 'insert valid JSON here')
            element.setAttribute('rows', 10)
        }
        container.replaceChild(element, options)
        options = element
    })

    navigator.serviceWorker.addEventListener('message', event => {
        // relay messages back to worker
        navigator.serviceWorker.controller.postMessage(event.data)
    })
}