
const scheduler = ( () => {
    const psigot = Polyglot.import("psigotInstance")
    const instance = Polyglot.import("scriptInstance")

    const Bukkit = Java.type("org.bukkit.Bukkit")
    const Runnable = Java.type("java.lang.Runnable")

    const setInterval = (cb, ticks) => {
        const runnableInterval = Java.extend(Runnable, {
            run() {
                cb(task)
            }
          })

        const task = Bukkit.getScheduler().runTaskTimer(psigot, new runnableInterval, ticks, ticks)
        instance.registerScheduler(task)

        return task
    }
    const clearInterval = task => {
        instance.unregisterScheduler(task);
    }

    const setTimeout = (cb, ticks) => {
        const runnableTimeout = Java.extend(Runnable, {
            run() {
                cb(task)
            }
        })

        const task = Bukkit.getScheduler().runTaskLater(psigot, new runnableTimeout, ticks)

        return task
    }

    const clearTimeout = task => {
        task.cancel()
    }

    return {setInterval, clearInterval, setTimeout, clearTimeout}
})()
