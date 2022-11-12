
const events = ( () => {
    const instance = Polyglot.import("scriptInstance")
    function create(path) {
        return callback => instance.registerEvent(Java.type(path), (_listener, event) => callback(event))
    }
    return {create}
})()
