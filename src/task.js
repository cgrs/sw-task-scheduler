class Task {
    constructor(name, date = new Date()) {
        this.name = name
        this.date = new Date(date)
        this.done = false
    }

    run() {
        return new Promise((resolve, reject) => {
            this.done = true
            resolve(this)
        })
    }
}