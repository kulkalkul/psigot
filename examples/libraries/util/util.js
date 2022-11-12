
const util = ( () => {

    const wrap = classObject => {
        const newObject = {}
        Object.keys(classObject).forEach( key => {
            newObject[key] = classObject[key]
            if (!key.startsWith("get")) return
            const getterName = key.slice(3, 4).toLowerCase() + key.slice(4)
            Object.defineProperty(newObject, getterName, {get: () => classObject[key]()} )
        })
        return newObject
    }

    const converter = (value) => {
        if (Array.isArray(value)) return value.reduce( (acc, cur) => {
            if (Java.isJavaObject(cur)) return [...acc, cur.toString()]
            return [...acc, converter(cur)]
        }, [])
        if (typeof value === "object") return Object.entries(value).reduce((acc, [key, value]) => {
            if (Java.isJavaObject(value)) return {...acc, [key]: value.toString()}
            return {...acc, [key]: converter(value)}
        }, {})
        return value
    }

    const debug = (...objects) => objects.forEach(x => console.log( JSON.stringify( converter(x) ) ))

    const ChatColor = Java.type("org.bukkit.ChatColor")
    const colorize = (string, delimiter="&") => ChatColor.translateAlternateColorCodes(delimiter, string)

    return {wrap, debug, colorize}
})()
