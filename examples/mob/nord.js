
const ItemHelper = require("./item");

// const EntityZombie = Java.type("net.minecraft.server.v1_13_R2.EntityZombie");
const Bukkit = Java.type("org.bukkit.Bukkit");
const InventoryHolder = Java.type("org.bukkit.inventory.InventoryHolder");
const Material = Java.type("org.bukkit.Material");
const ItemStack = Java.type("org.bukkit.inventory.ItemStack");

const ItemTagType = Java.type("org.bukkit.inventory.meta.tags.ItemTagType");

const InventoryClickEvent = events.create("org.bukkit.event.inventory.InventoryClickEvent");
const InventoryDragEvent = events.create("org.bukkit.event.inventory.InventoryDragEvent");

const TestInventory = Java.extend(InventoryHolder, {})
const inventory = Bukkit.createInventory(TestInventory, 9 * 2, util.colorize("&cDemirci"));

const NORD_SWORD = ItemHelper
  .fromMaterial(Material.IRON_SWORD)
  .name("&c&lNord Kılıcı")
  .lore("&eÜzerinde çok taşaklı bir Nord kılıcı", "&ebir çok taşaklıdır. Taşaklıdır.")
  .loreLine(3, "&eTaşaklıdır.")
  .loreLine(4, "&aSTR VERIR")
  .create();

inventory.addItem(NORD_SWORD);
inventory.addItem(NORD_SWORD);


command.on("envanter", ({sender}) => {
  sender.openInventory(inventory);
});

InventoryClickEvent(event => {
  const player = event.getWhoClicked();
  const playerInv = player.getInventory();
  const clickedInv = event.getClickedInventory();
  if (playerInv === clickedInv) return;
  if (!clickedInv) return;
  if (clickedInv.getName() !== util.colorize("&cDemirci")) return;
  event.setCancelled(true);
});

InventoryDragEvent(event => {
  const player = event.getWhoClicked();
  const playerInv = player.getInventory();
  const rawSlot = event.getRawSlots().iterator().next();
  const clickedInv = event.getView().getInventory(rawSlot);
  if (playerInv === clickedInv) return;
  if (clickedInv.getName() !== util.colorize("&cDemirci")) return;
  event.setCancelled(true);
});