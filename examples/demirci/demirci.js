
const Bukkit = Java.type("org.bukkit.Bukkit");
const Material = Java.type("org.bukkit.Material");
const ItemStack = Java.type("org.bukkit.inventory.ItemStack");
const Inventory = Java.type("org.bukkit.inventory");
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
const removeItem = (player, itemStack) => player.getInventory().removeItem(itemStack);

const capa = createItem(Material.IRON_HOE, "&7Demir Çapa");

const itemList = {
  "çapa": capa
}

command.on("capayap", ({sender, args}) => {
  if (!sender.isOp()) return;
  if (sender.Inventory.getInventory().containsAtLeast​(Material.IRON_INGOT, 2)) {
    if (sender.Inventory.getInventory().containsAtLeast​(Material.STICK, 2)) {
      addItem(sender, itemList["çapa"]);
      removeItem(sender, new ItemStack(Material.STICK, 2));
      removeItem(sender, new ItemStack(Material.IRON_INGOT, 2));
    }
  }
})