const Bukkit = Java.type("org.bukkit.Bukkit");

const PlayerToggleSprintEvent = events.create("org.bukkit.event.player.PlayerToggleSprintEvent");
const PlayerJoinEvent = events.create("org.bukkit.event.player.PlayerJoinEvent");

const walkSpeed = 0.135;
const runSpeed = 0.2;
const modifier = 0.01;

// Bukkit.getOnlinePlayers().forEach((player) => player.setWalkSpeed(walkSpeed));
// PlayerJoinEvent((event) => event.getPlayer().setWalkSpeed(walkSpeed));

PlayerToggleSprintEvent((event) => {
  const player = event.getPlayer();
  player.sendMessage("Selam");
  // if (!event.isSprinting()) return player.setWalkSpeed(walkSpeed);
  // const ceviklik = skript[player.getName()].ceviklik.$;
  // player.setWalkSpeed(runSpeed + ceviklik * modifier);
});