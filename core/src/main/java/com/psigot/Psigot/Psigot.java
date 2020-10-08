package com.psigot.Psigot;

import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;


public class Psigot extends JavaPlugin {

    private ScriptManager scriptManager;

    public static Psigot getInstance() {
        return Psigot.getPlugin(Psigot.class);
    }

    @Override
    public void onEnable() {
        scriptManager = new ScriptManager();
        this.getCommand("psigot").setExecutor(new CommandPsigot(scriptManager));
        Bukkit.getScheduler().scheduleSyncDelayedTask(this, () -> scriptManager.loadAll());
    }
}
