
require("./nord");

const Bukkit = Java.type("org.bukkit.Bukkit");
const Player = Java.type("org.bukkit.entity.Player");
const Material = Java.type("org.bukkit.Material");
const ItemTagType = Java.type("org.bukkit.inventory.meta.tags.ItemTagType");
const Action = Java.type("org.bukkit.event.block.Action");
const Vector = Java.type("org.bukkit.util.Vector");
const EntityType = Java.type("org.bukkit.entity.EntityType");

const PlayerInteractEvent = events.create("org.bukkit.event.player.PlayerInteractEvent");



PlayerInteractEvent(event => {
	const {player, action} = util.wrap(event);
	if (action !== Action.LEFT_CLICK_AIR) return;
	// const target = player.getTargetEntity(25, true);
	const block = player.getTargetBlock(50);
	const entities = block.getLocation().getNearbyEntities(10, 10, 10);
	// console.log(player.getType());
	entities.forEach((entity) => entity.getType() !== EntityType.PLAYER && entity.setVelocity(new Vector(0, 25, 0)));
	// if (!target) return;
	// target.damage(5, player);
});

EntityDamageEvent(event => {
	const damager = event.getDamager();
	const itemMeta = damager.getInventory().getItemInMainHand().getItemMeta();
	if (!itemMeta) return;
	if (!itemMeta.hasDisplayName()) return;
	if (itemMeta.getDisplayName() !== sarissa.getItemMeta().getDisplayName()) return;
	const entity = event.getEntity();
	const distance = damager.getLocation().distance(entity.getLocation());
	if (distance >= 4) return;
	event.setCancelled(true);
});