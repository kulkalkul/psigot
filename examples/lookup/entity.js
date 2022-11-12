
const UUID = Java.type("java.util.UUID");
const Bukkit = Java.type("org.bukkit.Bukkit");
const EntityType = Java.type("org.bukkit.entity.EntityType");

const ComponentBuilder = Java.type("net.md_5.bungee.api.chat.ComponentBuilder");
const TextComponent = Java.type("net.md_5.bungee.api.chat.TextComponent");
const ComponentBuilder$FormatRetention = Java.type("net.md_5.bungee.api.chat.ComponentBuilder.FormatRetention");
const HoverEvent = Java.type("net.md_5.bungee.api.chat.HoverEvent");
const ClickEvent = Java.type("net.md_5.bungee.api.chat.ClickEvent");
const HoverEvent$Action = Java.type("net.md_5.bungee.api.chat.HoverEvent.Action");
const ClickEvent$Action = Java.type("net.md_5.bungee.api.chat.ClickEvent.Action");

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

function findEntitiesInChunk(chunk, entityType) {
  const entities = chunk.getEntities();
  const foundEntities = [];
  for (let iEntity = 0; iEntity < entities.length; iEntity++) {
    const entity = entities[iEntity];

    if (entity.getType() !== entityType) continue;
    const UUID = entity.getUniqueId();
    const {x, y, z} = util.wrap(entity.getLocation());
    foundEntities.push({UUID, x, y, z});
  }
  return foundEntities;
}

command.on("delete-entity", ({sender, args}) => {
  if (!sender.isOp()) return;
  const [entityUUID, onay] = command.arguments(args, 2);
  if (!entityUUID) return sender.sendMessage(util.colorize("&cSilmek istediğiniz entity'nin UUID'sini girmediniz."));
  const entity = Bukkit.getEntity(UUID.fromString(entityUUID));
  if (!entity) return sender.sendMessage(util.colorize("&cBu UUID'ye ait bir entity sunucuda bulunmamaktadır."));
  if (onay === "onay") {
    sender.sendMessage(util.colorize("&aEntity başarıyla silindi."))
    entity.remove();
    return;
  }
  const {x, y, z} = util.wrap(entity.getLocation());

  const componentBuilder = new ComponentBuilder("");
  ComponentHelper.eventComponent(componentBuilder, `&a${entityUUID}`, [
    ComponentHelper.hoverEvent(`${x}, ${y}, ${z}`),
    ComponentHelper.clickEvent(`/teleport ${x} ${y} ${z}`)
  ]);
  ComponentHelper.legacyComponent(componentBuilder, " &cUUID'li entity'yi silme işlemi için onay gerek: ");
  ComponentHelper.eventComponent(componentBuilder, "&e[ ONAYLA ]", [
    ComponentHelper.hoverEvent("Onayla ve sil."),
    ComponentHelper.clickEvent(`/delete-entity ${entityUUID} onay`)
  ]);
  sender.sendMessage(componentBuilder.create());
});

command.on("clear-armour-stands", ({sender, args}) => {
  if (!sender.isOp()) return;
  const [radius] = command.arguments(args, 1);
  if (radius > 9) return sender.sendMessage(util.colorize("&cAramanız en fazla 8 chunk olabilir."));
  if (radius < 0) return sender.sendMessage(util.colorize("&cNegatif chunk giremezsiniz."));

  const {chunk, world} = util.wrap(sender.getLocation());
  const {x, z} = util.wrap(chunk);

  let entities = [];

  for (let iX = radius*-1; iX <= radius; iX++) {
    for (let iZ = radius*-1; iZ <= radius; iZ++) {
      const chunk = world.getChunkAt(x + iX, z + iZ);
      entities = [...entities, ...findEntitiesInChunk(chunk, EntityType.ARMOR_STAND)];
    }
  }

});

command.on("lookup-entity", ({sender, args}) => {
  if (!sender.isOp()) return;
  const [radius, entityType] = command.arguments(args, 2);

  if (radius > 9) return sender.sendMessage(util.colorize("&cAramanız en fazla 8 chunk olabilir."));
  if (radius < 0) return sender.sendMessage(util.colorize("&cNegatif chunk giremezsiniz."));
  if (!EntityType[entityType]) return sender.sendMessage(util.colorize("&cAradığınız entity hatalı, düzeltin."));

  const entity = EntityType[entityType];

  const {chunk, world} = util.wrap(sender.getLocation());
  const {x, z} = util.wrap(chunk);

  let entities = [];

  for (let iX = radius*-1; iX <= radius; iX++) {
    for (let iZ = radius*-1; iZ <= radius; iZ++) {
      const chunk = world.getChunkAt(x + iX, z + iZ);
      entities = [...entities, ...findEntitiesInChunk(chunk, entity)];
    }
  }

  const componentBuilder = new ComponentBuilder("");
  entities.forEach(({UUID, x, y, z}, index) => {
    ComponentHelper.eventComponent(componentBuilder, `&a${index} &7[ `, [
      ComponentHelper.hoverEvent(`${x}, ${y}, ${z}`),
      ComponentHelper.clickEvent(`/teleport ${x} ${y} ${z}`)
    ]);
    ComponentHelper.eventComponent(componentBuilder, "&cX", [
      ComponentHelper.hoverEvent(`Bu entity'yi sil.`),
      ComponentHelper.clickEvent(`/delete-entity ${UUID.toString()}`)
    ]);
    ComponentHelper.legacyComponent(componentBuilder, " &7]" + (index === entities.length-1 ? "" : ", "));
  });

  sender.sendMessage(componentBuilder.create());
});