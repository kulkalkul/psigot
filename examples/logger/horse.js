
const Logger = require("./logger");

const UUID = Java.type("java.util.UUID");
const JavaDate = Java.type("java.util.Date");
const SimpleDateFormat = Java.type("java.text.SimpleDateFormat");

const Bukkit = Java.type("org.bukkit.Bukkit");
const Location = Java.type("org.bukkit.Location");
const Player = Java.type("org.bukkit.entity.Player");
const AbstractHorse = Java.type("org.bukkit.entity.AbstractHorse");
const Material = Java.type("org.bukkit.Material");

const ComponentBuilder = Java.type("net.md_5.bungee.api.chat.ComponentBuilder");
const TextComponent = Java.type("net.md_5.bungee.api.chat.TextComponent");
const ComponentBuilder$FormatRetention = Java.type("net.md_5.bungee.api.chat.ComponentBuilder.FormatRetention");
const HoverEvent = Java.type("net.md_5.bungee.api.chat.HoverEvent");
const ClickEvent = Java.type("net.md_5.bungee.api.chat.ClickEvent");
const HoverEvent$Action = Java.type("net.md_5.bungee.api.chat.HoverEvent.Action");
const ClickEvent$Action = Java.type("net.md_5.bungee.api.chat.ClickEvent.Action");


const EntityMountEvent = events.create("org.spigotmc.event.entity.EntityMountEvent");
const EntityDismountEvent = events.create("org.spigotmc.event.entity.EntityDismountEvent");
const EntityDeathEvent = events.create("org.bukkit.event.entity.EntityDeathEvent");

horseLogger = new Logger("horse");

const horseEvents = horseLogger.createDomain("events", persist.object);
const horses = horseLogger.createDomain("horses", persist.object);
const players = horseLogger.createDomain("players", persist.object);

function createHorseEvent(action, data) {
  const eventUUID = UUID.randomUUID();
  horseEvents.persisted[eventUUID] = persist.object;

  horseEvents.persisted[eventUUID].time = Date.now();
  horseEvents.persisted[eventUUID].action = action;
  Object.entries(data).forEach(([key, value]) => horseEvents.persisted[eventUUID][key] = value);

  return eventUUID;
}

function addEventToHorses(mountUUID, eventUUID, location) {
  if (!horses.persisted[mountUUID]) horses.persisted[mountUUID] = persist.object;
  if (!horses.persisted[mountUUID].events) horses.persisted[mountUUID].events = persist.array;
  horses.persisted[mountUUID].lastKnownLocation = location;
  horses.persisted[mountUUID].events.push(eventUUID.toString());
}

function addEventToPlayers(playerUUID, eventUUID) {
  if (!players.persisted[playerUUID]) players.persisted[playerUUID] = persist.array;
  players.persisted[playerUUID].push(eventUUID.toString());
}

function horseCheck(mount) {
  if (!(mount instanceof AbstractHorse)) return;
  if (mount.getEquipment().getHelmet().getType() !== Material.AIR) return;
  return true;
}

function serializeLocation(location) {
  const {x, y, z, world} = util.wrap(location);
  const serialized = persist.object;
  serialized.x = parseInt(x);
  serialized.y = parseInt(y);
  serialized.z = parseInt(z);
  serialized.world = world.getName();
  return serialized;
}

EntityMountEvent(event => {
  if (!(event.getEntity() instanceof Player)) return;

  const mount = event.getMount();
  if (!horseCheck(mount)) return;

  const playerUUID = event.getEntity().getUniqueId();
  const mountUUID = mount.getUniqueId();

  const eventUUID = createHorseEvent("mount", {player: playerUUID.toString(), mount: mountUUID.toString()});
  const location = serializeLocation(mount.getLocation());
  addEventToHorses(mountUUID, eventUUID, location);
  addEventToPlayers(playerUUID, eventUUID);
});

EntityDismountEvent(event => {
  if (!(event.getEntity() instanceof Player)) return;

  const mount = event.getDismounted();
  if (!horseCheck(mount)) return;

  const playerUUID = event.getEntity().getUniqueId();
  const mountUUID = mount.getUniqueId();

  const eventUUID = createHorseEvent("dismount", {player: playerUUID.toString(), mount: mountUUID.toString()});
  const location = serializeLocation(mount.getLocation());
  addEventToHorses(mountUUID, eventUUID, location);
  addEventToPlayers(playerUUID, eventUUID);
})

EntityDeathEvent(event => {
  const entity = event.getEntity();
  if (!horseCheck(entity)) return;

  const mountUUID = entity.getUniqueId();
  const player = entity.getKiller();
  if (!player) return;
  const playerUUID = player.getUniqueId();

  const eventUUID = createHorseEvent("death", {player: playerUUID.toString(), mount: mountUUID.toString()});
  const location = serializeLocation(entity.getLocation());
  addEventToHorses(mountUUID, eventUUID, location);
  addEventToPlayers(playerUUID, eventUUID);
});

class ComponentHelper {
  static legacyComponent(componentBuilder, text) {
    componentBuilder.append(TextComponent.fromLegacyText(util.colorize(text)), ComponentBuilder$FormatRetention.FORMATTING);
  }
  static eventComponent(componentBuilder, text, events) {
    componentBuilder.append(util.colorize(text), ComponentBuilder$FormatRetention.FORMATTING);
    events.forEach(event => componentBuilder.event(event))
  }
  static hoverEvent(hoverText) {
    return new HoverEvent(HoverEvent$Action.SHOW_TEXT, [ new TextComponent(util.colorize(hoverText)) ]);
  }
  static clickEvent(command) {
    return new ClickEvent(ClickEvent$Action.RUN_COMMAND, command)
  }
}

class LoggerHelper {
  static paginate(array, page) {
    page = page || 1;
    const pageMax = Math.ceil(array.length / 5);
    if (page < 1) page = 1;
    if (page > pageMax) page = pageMax;

    let pageStart = array.length - (page * 5);
    const pageEnd = pageStart + 5;
    if (pageStart < 0) pageStart = 0;

    return [array.slice(pageStart, pageEnd), page, pageMax];
  }
  static showLabel(name, key, hover, click, pageCommand, page, pageMax) {
    const componentBuilder = new ComponentBuilder("");
    ComponentHelper.legacyComponent(componentBuilder, `${name} &r- `);
    ComponentHelper.eventComponent(componentBuilder, key, [
      ComponentHelper.hoverEvent(hover),
      ComponentHelper.clickEvent(click)
    ])
    ComponentHelper.legacyComponent(componentBuilder,` &r - `);
    ComponentHelper.eventComponent(componentBuilder, "&a«", [
      ComponentHelper.clickEvent(`${pageCommand} ${page - 1}`)
    ]);
    ComponentHelper.legacyComponent(componentBuilder,` ${page}&b/&r${pageMax} `);
    ComponentHelper.eventComponent(componentBuilder, "&a»", [
      ComponentHelper.clickEvent(`${pageCommand} ${page + 1}`)
    ]);

    return componentBuilder.create();
  }
  static showLog(eventUUID, key, command, formatCb) {
    const eventObject = horseEvents.persisted[eventUUID];
    const {time, action, [key]: data} = eventObject;

    const date = new JavaDate(time);
    const dateFormat = new SimpleDateFormat("dd/MM/yy - HH:mm");
    const formattedDate = dateFormat.format(date);

    const componentBuilder = new ComponentBuilder("");
    ComponentHelper.legacyComponent(componentBuilder, `&7[${formattedDate}] `);
    ComponentHelper.eventComponent(componentBuilder, `&e${formatCb(data)}`, [
      ComponentHelper.hoverEvent(`&e${data.toString()}`),
      ComponentHelper.clickEvent(`${command} ${data.toString()}`)
    ]);
    ComponentHelper.legacyComponent(componentBuilder, ` &r${action}`);
    return componentBuilder.create();
  }
}

command.on("logger-horse", ({sender, args}) => {
  if (!sender.isOp()) return;
  const [subCommand, restArgs] = command.arguments(args, 2, false);
  switch (subCommand) {
    case "player": {
      const [playerArg, pageArg] = command.arguments(restArgs, 2);
      const player = Bukkit.getOfflinePlayer(playerArg);
      const playerUUID = player.getUniqueId();

      if (!players.persisted[playerUUID]) return sender.sendMessage(`${playerArg} için loglar bulunamadı.`);

      const [localArray, page, pageMax] = LoggerHelper.paginate(players.persisted[playerUUID], parseInt(pageArg));

      const label = LoggerHelper.showLabel("&c[Horse Log]", `&e${player.getName()}`, `&e${playerUUID}`,
        `/logger-horse teleport_to_player ${playerUUID}`, `/logger-horse player ${playerArg}`, page, pageMax);
      sender.sendMessage(label);

      localArray.reverse().forEach(eventUUID => {
        const log = LoggerHelper.showLog(eventUUID, "mount", "/logger-horse horse",
          data => `${data.slice(0, 15)}...`);
        sender.sendMessage(log);
      });

      break;
    }
    case "player_uuid": {
      const [playerArg, pageArg] = command.arguments(restArgs, 2);
      const playerUUID = UUID.fromString(playerArg);
      const player = Bukkit.getOfflinePlayer(playerUUID);

      if (!players.persisted[playerUUID]) return sender.sendMessage(`${playerArg} için loglar bulunamadı.`);

      const [localArray, page, pageMax] = LoggerHelper.paginate(players.persisted[playerUUID], parseInt(pageArg));

      const label = LoggerHelper.showLabel("&c[Horse Log]", `&e${player.getName()}`, `&e${playerUUID}`,
        `/logger-horse teleport_to_player ${playerUUID}`,`/logger-horse player_uuid ${playerArg}`, page, pageMax);
      sender.sendMessage(label);

      localArray.reverse().forEach(eventUUID => {
        const log = LoggerHelper.showLog(eventUUID, "mount", "/logger-horse horse",
          data => `${data.slice(0, 15)}...`);
        sender.sendMessage(log);
      });

      break;
    }
    case "horse": {
      const [mountArg, pageArg] = command.arguments(restArgs, 2);
      const mountUUID = UUID.fromString(mountArg);

      if (!horses.persisted[mountUUID]) return sender.sendMessage(`${mountArg} için loglar bulunamadı.`);

      const [localArray, page, pageMax] = LoggerHelper.paginate(horses.persisted[mountUUID].events, parseInt(pageArg));

      const label = LoggerHelper.showLabel("&c[Horse Log]", `&e${mountUUID.toString().slice(0, 15)}`,
        `&e${mountUUID}`,`/logger-horse teleport_to_horse ${mountUUID}`,
        `/logger-horse horse ${mountArg}`, page, pageMax);
      sender.sendMessage(label);

      localArray.reverse().forEach(eventUUID => {
        const log = LoggerHelper.showLog(eventUUID, "player", "/logger-horse player_uuid",
          data => Bukkit.getOfflinePlayer(UUID.fromString(data)).getName());
        sender.sendMessage(log);
      });

      break;
    }
    case "teleport_to_horse": {
      const [mountArg] = command.arguments(restArgs, 1);
      const mountUUID = UUID.fromString(mountArg);
      const mount = Bukkit.getEntity(mountUUID);
      if (!mount) {
        sender.sendMessage(`${mountArg} yüklü bir chunkta değil veya ölü. Bilinen son konumuna ışınlanıldı.`);
        const {x, y, z, world} = horses.persisted[mountUUID].lastKnownLocation;
        const location = new Location(Bukkit.getWorld(world), x, y, z);
        return sender.teleport(location);
      }
      sender.teleport(mount);

      break;
    }
    case "teleport_to_player": {
      const [playerArg] = command.arguments(restArgs, 1);
      const playerUUID = UUID.fromString(playerArg);
      const player = Bukkit.getPlayer(playerUUID);
      if (!player) return sender.sendMessage(`${Bukkit.getOfflinePlayer(playerUUID).getName()} oyunda değil.`)
      sender.teleport(player);

      break;
    }
  }
})
