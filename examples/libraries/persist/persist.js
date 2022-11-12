
const persist = (() => {

    const instance = Polyglot.import("scriptInstance")

    const persistenceInstance = instance.getPersistence()

    const objectNavigator = key => {
        const keys = key.split(".")
        return keys.reduce((acc, cur) => {
            return acc[cur]
        }, get())
    }

    const objectSetter = (key, value) => {
        const keys = key.split(".")
        keys.reduce((acc, cur, index) => {
            if (index === keys.length - 1) acc[cur] = value
            return acc[cur]
        }, get())
    }

    const get = () => persistenceInstance.getPersisted()
    const object = () => persistenceInstance.createObject()
    const array = () => persistenceInstance.createArray()
    const init = (key, object) => {
        const selectedObject = objectNavigator(key)
        if (selectedObject) return
        objectSetter(key, object)
    }

    return {
        get,
        init,
        get object() { return object() },
        get array() { return array() }
    }

})()
