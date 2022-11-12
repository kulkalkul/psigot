
const Bukkit = Java.type("org.bukkit.Bukkit")
const UUID = Java.type("java.util.UUID")

function safeGround(location) {
    const localLocation = location.clone()
    if (localLocation.getBlock().isEmpty()) return lowestGround(localLocation)
    else return highestGround(localLocation)
}

function highestGround(location) {
    location.add(0, 1, 0)
    if (!location.getBlock().isEmpty()) return highestGround(location)
    location.add(0, -1, 0)
    return location
}

function lowestGround(location) {
    location.add(0, -1, 0)
    if (location.getBlock().isEmpty()) return lowestGround(location)
    location.add(0, 1, 0)
    return location
}

function lowestVehicle(entity) {
    if (entity.getVehicle()) return lowestVehicle(entity.getVehicle())
    return entity
}

command.on("vehicle_teleport", ({sender, args}) => {
    if (!sender.isOp()) return
    const [target, to] = command.arguments(args, 2)
    
    const playerTarget = Bukkit.getPlayer(target)
    const playerTo = Bukkit.getPlayer(to)

    if (!playerTarget) return sender.sendMessage("Hedef oyuncuyu girmediniz.")
    if (!playerTo) return sender.sendMessage("İstikamet oyuncuyu girmediniz.")

    sender.sendMessage(`${playerTarget.getName()} adlı oyuncuyu ${playerTo.getName()} oyuncusuna teleportladınız.`)
    const {x, y, z, yaw, pitch} = util.wrap(safeGround(playerTo.getLocation()))
    const vehicleTarget = lowestVehicle(playerTarget).getHandle()
    vehicleTarget.setPositionRotation(x, y, z, yaw, pitch)
})

command.on("find_entity", ({sender, args}) => {
	if (!sender.isOp()) return
	const [entityUUID] = command.arguments(args, 1)
	if (!entityUUID) return sender.sendMessage("Bir UUID girmediniz.")
	const entity = Bukkit.getEntity(UUID.fromString(entityUUID))
	if (!entity) return sender.sendMessage(`${entityUUID} ile bir entity bulunmuyor veya yüklü bir chunkta değil.`)
	sender.teleport(entity.getLocation())
})