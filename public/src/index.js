; !function () {
    function $(selector){let elements=Array.from(document.querySelectorAll(selector));return elements.length===1?elements[0]:elements}

    const messaging = firebase.messaging(),
        database = firebase.database(),
        auth = firebase.auth()
    // ,publicVapidKey = `BL51qF8ZnSEuFtalek9eb1VCaVPQQRWgU03Gn8hamrAXq_t2qvpqb26ci2kEoOa6L2aDK0atPdEf_sgME5NEXxA`

    auth.onAuthStateChanged(handleAuthStateChanged)

    function handleAuthStateChanged(user) {
        if (user) {
            console.log(user, 'logged in')
            registerServiceWorker()
            toggleUI()
        } else {
            console.log('no user logged in')
            unregisterServiceWorker()
        }
    }

    function toggleUI() {
        toggleForm()
        toggleLoginButton()
    }

    function unregisterServiceWorker() {
        if ('serviceWorker' in navigator && !!navigator.serviceWorker.controller) {
            if (/\/sw\.js$/.test(navigator.serviceWorker.controller.scriptURL)) {
                navigator.serviceWorker.getRegistration()
                .then(reg => reg.unregister())
                .then(() => {
                    console.log(`service worker unregistered`)
                })
            }
        }    
    }

    function toggleLoginButton() {
        $('button#login').classList.toggle('hidden')
    }

    function toggleForm() {
        $('input, button:not(#login)').map(el => el.classList.toggle('hidden'))
    }

    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            if (!!navigator.serviceWorker.controller)
                return // already registered worker
            navigator.serviceWorker.register('./sw.js')
                .then(reg => {
                    messaging.useServiceWorker(reg)
                    console.log(`service worker registered`)
                    // assume user is logged in
                    messaging.getToken().then(token => {
                        addUserToDatabase(auth.currentUser, token)
                    })
                })
        }
        else {
            document.body.innerHTML =
                '<p class="centered">' +
                'Service workers are not supported. ' +
                'Please <a href="https://browsehappy.com/" target="_blank">' +
                'upgrade your browser</a>.</p>'
        }
    }

    function setup() {
        const inputTitle = $('input#title'),
               inputDate = $('input#date'),
                    form = $('form#main-form'),
                     now = new Date()

        inputDate.value = now.toISOString().slice(0, -8)

        form.addEventListener('submit', sendNotification)

        function sendNotification(event) {
            event.preventDefault()
            // TODO: send task to Database
            addTaskToDatabase(new Task(inputTitle.value, inputDate.value))
        }

        messaging.onMessage(payload => {
            console.log(payload, 'received')
            // TODO: show notification
            showNotification(payload.notification)
        })

        $('button#login').addEventListener('click', showPopupLogin)
        $('button#logout').addEventListener('click', logOut)

        function logOut() {
            toggleUI()
            return auth.signOut()
        }
        function showPopupLogin() {
            return auth.signInWithPopup(new firebase.auth.GoogleAuthProvider)
        }
    }

    function addTaskToDatabase(task) {
        return database.ref('/events').push(task, () => {
            console.log('added', task)
        })
    }

    function addUserToDatabase(user, token) {
        return database.ref(`/users/${user.uid}`).set({
            email: user.email,
            token 
        }, () => {
            console.log('added', user)
        })
    }

    function showNotification(notification) {
        return new Notification(notification.title, {
            body: notification.body
        })
    }

    document.addEventListener('DOMContentLoaded', setup)
}()