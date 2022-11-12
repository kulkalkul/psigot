
const Bukkit = Java.type("org.bukkit.Bukkit");
const UUID = Java.type("java.util.UUID");
const StandardCharsets = Java.type("java.nio.charset.StandardCharsets");
const String = Java.type("java.lang.String");
const EntityPlayer = Java.type("net.minecraft.server.v1_13_R2.EntityPlayer");
const PlayerInteractManager = Java.type("net.minecraft.server.v1_13_R2.PlayerInteractManager");

function offlineUUID(name) {
  const combined = new String(`OfflinePlayer:${name}`);
  return UUID.nameUUIDFromBytes(combined.getBytes(StandardCharsets.UTF_8));
}

console.log(offlineUUID("sa"));

function createPlayer(offlinePlayer) {
  const server = Bukkit.getServer().getServer();
  const profile = offlinePlayer.getProfile();
  const worldServer = server.getWorldServer(0);
  const playerInteractManager = new PlayerInteractManager(worldServer);
  const player = new EntityPlayer(server, worldServer, profile, playerInteractManager);
  return player.getBukkitEntity();
}

command.on("offline_inventory", ({sender, args}) => {
  if (!sender.isOp()) return;
  const name = command.arguments(args, 1);
  const playerUUID = offlineUUID(name);
  const offlinePlayer = Bukkit.getOfflinePlayer(playerUUID);
  if (!offlinePlayer.hasPlayedBefore()) return sender.sendMessage(util.colorize("&cBöyle bir oyuncu mevcut değil."));
  if (offlinePlayer.isOnline()) return sender.openInventory(offlinePlayer.getPlayer().getInventory());
  const player = createPlayer(offlinePlayer);
  sender.openInventory(player.getInventory());
});