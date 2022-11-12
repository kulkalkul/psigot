
const Material = Java.type("org.bukkit.Material");
const Chest = Java.type("org.bukkit.block.Chest");

const ComponentBuilder = Java.type("net.md_5.bungee.api.chat.ComponentBuilder");
const TextComponent = Java.type("net.md_5.bungee.api.chat.TextComponent");
const ComponentBuilder$FormatRetention = Java.type("net.md_5.bungee.api.chat.ComponentBuilder.FormatRetention");
const HoverEvent = Java.type("net.md_5.bungee.api.chat.HoverEvent");
const ClickEvent = Java.type("net.md_5.bungee.api.chat.ClickEvent");
const HoverEvent$Action = Java.type("net.md_5.bungee.api.chat.HoverEvent.Action");
const ClickEvent$Action = Java.type("net.md_5.bungee.api.chat.ClickEvent.Action");

function findItemsInChunk(chunk, material) {
  const tileEntities = chunk.getTileEntities();
  const foundTileEntities = [];
  for (let iTile = 0; iTile < tileEntities.length; iTile++) {
    const tileEntity = tileEntities[iTile];

    if (!(tileEntity instanceof Chest)) continue;

    const location = tileEntity.getLocation();
    const inventory = tileEntity.getInventory();

    const foundItems = inventory.all(material).values().toArray();

    let count = 0;
    for (let iItem = 0; iItem < foundItems.length; iItem++) {
      count = count + foundItems[iItem].getAmount();
    }
    if (!count) continue;
    foundTileEntities.push({x: location.getX(), y: location.getY(), z: location.getZ(), count});
  }
  return foundTileEntities;
}

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

command.on("lookup-chest", ({sender, args}) => {
  if (!sender.isOp()) return;
  const [radius, item] = command.arguments(args, 2);

  if (radius > 9) return sender.sendMessage(util.colorize("&cAramanız en fazla 8 chunk olabilir."));
  if (radius < 0) return sender.sendMessage(util.colorize("&cNegatif chunk giremezsiniz."));
  if (!Material[item]) return sender.sendMessage(util.colorize("&cAradığınız item hatalı, düzeltin."));

  const material = Material[item];

  const {chunk, world} = util.wrap(sender.getLocation());
  const {x, z} = util.wrap(chunk);

  let tileEntities = [];

  for (let iX = radius*-1; iX <= radius; iX++) {
    for (let iZ = radius*-1; iZ <= radius; iZ++) {
      const chunk = world.getChunkAt(x + iX, z + iZ);
      tileEntities = [...tileEntities, ...findItemsInChunk(chunk, material)];
    }
  }

  const sorted = tileEntities.sort((a, b) => a.count - b.count);
  const componentBuilder = new ComponentBuilder("");
  sorted.forEach(({count, x, y, z}, index) => {
    ComponentHelper.eventComponent(componentBuilder, `&c${count}`, [
      ComponentHelper.hoverEvent(`${x}, ${y}, ${z}`),
      ComponentHelper.clickEvent(`/teleport ${x} ${y} ${z}`)
    ]);
    ComponentHelper.legacyComponent(componentBuilder, "&7" + (index === sorted.length-1 ? "" : ", "));
  });

  sender.sendMessage(componentBuilder.create());

});
