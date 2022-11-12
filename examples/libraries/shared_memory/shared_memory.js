
const sharedM = (() => {

    const instance = Polyglot.import("scriptInstance")

    const sharedMemoryInstance = instance.getSharedMemory()

    const get = ID => sharedMemoryInstance.get(ID)
    const set = (ID, value) => sharedMemoryInstance.set(ID, value)
    const init = (ID, value) => {
        set(ID, value)
        return value
    }
    const remove = ID => sharedMemoryInstance.remove(ID)
    const object = () => sharedMemoryInstance.createObject()
    const array = () => sharedMemoryInstance.createArray()

    return {
        get,
        set,
        init,
        remove,
        get object() { return object() },
        get array() { return array() }
    }

})()
