
const command = ( () => {

    const instance = Polyglot.import("scriptInstance")
    const Command = Java.type("org.bukkit.command.Command")

    function on(name, callback, {description, usage, aliases}={}) {
        description = description || ""
        usage = usage || ""
        aliases = aliases || []

        const command = Java.extend(Command, {execute(sender, label, args) {
            callback({sender, label, args: Java.from(args)})
            return true
        }})
        instance.registerCommand(name, new command(name, description, usage, aliases))
    }

    function arguments(args, argNumber, join=true) {
        return [...args.slice(0, argNumber - 1), join ? args.slice(argNumber - 1).join(" ") : args.slice(argNumber - 1)]
    }

    return {on, arguments}
})()
