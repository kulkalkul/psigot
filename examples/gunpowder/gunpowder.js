
const Bukkit = Java.type("org.bukkit.Bukkit");
const Material = Java.type("org.bukkit.Material");
const ItemStack = Java.type("org.bukkit.inventory.ItemStack");
const EquipmentSlot = Java.type("org.bukkit.inventory.EquipmentSlot");
const Player = Java.type("org.bukkit.entity.Player");
const Particle = Java.type("org.bukkit.Particle");
const ParticleBuilder = Java.type("com.destroystokyo.paper.ParticleBuilder");
const Vector = Java.type("org.bukkit.util.Vector");
const Sound = Java.type("org.bukkit.Sound");
const SoundCategory = Java.type("org.bukkit.SoundCategory");

const PlayerInteractEvent = events.create("org.bukkit.event.player.PlayerInteractEvent");

const createItem = (material, name, lore=[]) => {
  const itemStack = new ItemStack(material);
  const itemMeta = itemStack.getItemMeta();

  itemMeta.setDisplayName(util.colorize(name));
  if (lore.length) itemMeta.setLore(lore.map(line => util.colorize(line)));
  itemStack.setItemMeta(itemMeta);

  return itemStack;
}

const addItem = (player, itemStack) => player.getInventory().addItem(itemStack);

const musketEmpty = createItem(Material.BLAZE_ROD, "&cTüfek", ["&7Boş"]);
const musketPowderFilled = createItem(Material.BLAZE_ROD, "&cTüfek", ["&7Barut Dolu"]);
const musketCocked = createItem(Material.BLAZE_ROD, "&cTüfek", ["&7Sürgülenmiş"]);
const powder = createItem(Material.GUNPOWDER, "&8Barut");
const ball = createItem(Material.IRON_NUGGET, "&7Kurşun");

const itemList = {
  "tüfek": musketEmpty,
  "barut": powder,
  "kurşun": ball
}

command.on("gunpowder", ({sender, args}) => {
  if (!sender.isOp()) return;
  const [subCommand, restArgs] = command.arguments(args, 2, false);
  switch(subCommand) {
    case "give": {
      const [item] = command.arguments(restArgs, 1);
      if (!itemList[item]) return sender.sendMessage(`Böyle bir eşya yok "${item}".`);
      addItem(sender, itemList[item]);
    }
  }
});

const checkMainHand = (event, itemStack) => {
  if (!event.getItem()) return;
  if (!event.getItem().isSimilar(itemStack)) return;
  if (event.getHand() !== EquipmentSlot.HAND) return;
  return true;
}
const checkOffHand = (inventory, itemStack) => {
  if (!inventory.getItemInOffHand()) return;
  if (!inventory.getItemInOffHand().isSimilar(itemStack)) return;
  return true;
}

let playerGunData = {}

const setGunData = (UUID, value) => playerGunData = {...playerGunData, [UUID]: value};
const setGunTick = (UUID, tick) => setGunData(UUID, {...playerGunData[UUID], tick})
const setGunFirstTick = (UUID, firstTick) => setGunData(UUID, {...playerGunData[UUID], firstTick})
const getGunData = UUID => playerGunData[UUID];

const resetGunData = UUID => {
  setGunFirstTick(UUID, Bukkit.getCurrentTick());
  setGunTick(UUID, Bukkit.getCurrentTick());
}

const initializeFirstClick = UUID => {
  if (getGunData(UUID) && getGunData(UUID).firstTick) return;
  resetGunData(UUID);
}

const updateTick = UUID => setGunTick(UUID, Bukkit.getCurrentTick());
const checkTick = UUID => {
  if (Bukkit.getCurrentTick() - getGunData(UUID).tick <= 4) return true;
  resetGunData(UUID);
}

const runFunctionAfterTick = (UUID, ticks, callback) => {
  if (Bukkit.getCurrentTick() - getGunData(UUID).firstTick < ticks) return;
  callback();
}

PlayerInteractEvent(event => {
  if (!checkMainHand(event, musketEmpty)) return;
  const player = event.getPlayer();
  const inventory = player.getInventory();
  if (!checkOffHand(inventory, powder)) return;

  const UUID = player.getUniqueId();
  initializeFirstClick(UUID);
  if (!checkTick(UUID)) return;
  updateTick(UUID);
  runFunctionAfterTick(UUID, 60, () => {
    inventory.getItemInOffHand().add(-1);
    inventory.setItemInMainHand(musketPowderFilled);
    resetGunData(UUID);
  });
});

PlayerInteractEvent(event => {
  if (!checkMainHand(event, musketPowderFilled)) return;
  const player = event.getPlayer();
  const inventory = player.getInventory();
  if (!checkOffHand(inventory, ball)) return;

  const UUID = player.getUniqueId();
  initializeFirstClick(UUID);
  if (!checkTick(UUID)) return;
  updateTick(UUID);
  runFunctionAfterTick(UUID, 30, () => {
    inventory.getItemInOffHand().add(-1);
    inventory.setItemInMainHand(musketCocked);
    resetGunData(UUID);
  });
});

const spawnParticle = (particle, location, vector, count, speed) => {
  const localLocation = location.clone();
  localLocation.add(vector);
  const particleBuilder = new ParticleBuilder(particle);
  particleBuilder.location(localLocation);
  particleBuilder.extra(speed);
  particleBuilder.count(count);
  particleBuilder.spawn();
}

const spawnParticleInGroup = (particle, location, vector, count, speed, startPos, endPos) => {
  for (let x = startPos; x <= endPos; x++) {
    spawnParticle(particle, location, vector.clone()
      .multiply(new Vector(1 + 0.1 * x, 1, 1 + 0.1 * x)), count, speed);
  }
}

PlayerInteractEvent(event => {
  if (!checkMainHand(event, musketCocked)) return;
  const player = event.getPlayer();
  if (player.getInventory().getItemInOffHand().getType() !== Material.AIR) return;
  const location = player.getLocation().add(0, 1.3, 0);
  const direction = location.getDirection().normalize();

  player.getInventory().setItemInMainHand(musketEmpty);

  location.getWorld().playSound(location, Sound.ENTITY_GENERIC_EXPLODE, SoundCategory.PLAYERS, 4, 1);
  location.getWorld().playSound(location, Sound.ENTITY_GENERIC_EXPLODE, SoundCategory.PLAYERS, 6, 1.5);
  location.getWorld().playSound(location, Sound.ENTITY_GENERIC_EXPLODE, SoundCategory.PLAYERS, 8, 2);

  spawnParticleInGroup(Particle.SMOKE_LARGE, location, direction, 25, 0.01, -6, 6);
  spawnParticleInGroup(Particle.SMOKE_LARGE, location, direction.clone().multiply(new Vector(1.5, 1, 1.5)),
    3, 0.025, -3, 3);
  spawnParticleInGroup(Particle.SMOKE_LARGE, location, direction.clone().multiply(new Vector(2.5, 1, 2.5)),
    2, 0.025, -1, 1);
  spawnParticleInGroup(Particle.FLAME, location,
    direction.clone().multiply(new Vector(0.7, 1, 0.7)).add(new Vector(0, -0.2, 0)),
    2, 0.01, -1, 1);

  let distance = 0;
  let drop = 0;
  const ballLocation = location.clone();
  while (distance < 100) {
    distance++;
    if (!ballLocation.getBlock().isEmpty()) {
      location.getWorld().playSound(location, Sound.ITEM_TRIDENT_HIT, SoundCategory.PLAYERS, 1, 0.5);
      location.getWorld().playSound(location, Sound.ITEM_TRIDENT_HIT, SoundCategory.PLAYERS, 1, 1);
      break;
    }
    ballLocation.add(direction);
    drop = drop + distance * 0.0001 * -1
    ballLocation.add(0, drop, 0)
	//spawnParticle(Particle.FLAME, ballLocation, new Vector(0, 0, 0), 5, 0);
    const entities = ballLocation.getNearbyEntities(0.3, 0.3, 0.3);
    if (!entities.length) continue;
	if (entities[0] instanceof Player) entities[0].damage(10, player);
    else entities[0].damage(40, player);
    location.getWorld().playSound(location, Sound.ITEM_TRIDENT_HIT, SoundCategory.PLAYERS, 1, 0.5);
    location.getWorld().playSound(location, Sound.ITEM_TRIDENT_HIT, SoundCategory.PLAYERS, 1, 1);
    break;
  }
});
