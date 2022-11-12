
const PlayerItemHeldEvent = events.create("org.bukkit.event.player.PlayerItemHeldEvent");

PlayerItemHeldEvent((event) => {
	const player = event.getPlayer();
	if (!player.hasPermission("admin")) return;
	const buyuMod = skript.vb.bora.buyu.mod[player.getName()].$;
	util.debug(buyuMod);
	if (!buyuMod) return;
	player.sendMessage("deneme");
});