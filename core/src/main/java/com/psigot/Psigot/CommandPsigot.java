package com.psigot.Psigot;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;

public class CommandPsigot implements CommandExecutor {

    private ScriptManager scriptManager;

    public CommandPsigot(ScriptManager scriptManager) {
        this.scriptManager = scriptManager;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        
        if (args.length == 0) return false;

        String subCommand = args[0];

        switch (subCommand) {
            case "load":
            case "reload":
                load(sender, args);
                return true;
            case "unload":
                unload(sender, args);
                return true;
            case "loadall":
            case "reloadall":
                loadAll(sender);
                return true;
            case "unloadall": {
                unloadAll(sender);
                return true;
            }
        }
        return false;
    }

    private void load(CommandSender sender, String[] args) {
        if (args.length == 1) {
            sender.sendMessage("Module name didn't specified.");
            return;
        }

        String ID = args[1];
        ScriptManager.ModuleStatus moduleStatus = scriptManager.load(ID);

        switch(moduleStatus) {
            case NON_EXISTENT: {
                sender.sendMessage(String.format("No module with ID %s found in scripts directory.", ID));
                break;
            }
            case LOADED: {
                sender.sendMessage(String.format("Module %s successfully loaded to the memory.", ID));
                break;
            }
        }
    }

    private void unload(CommandSender sender, String[] args) {
        if (args.length == 1) {
            sender.sendMessage("Module name didn't specified.");
            return;
        }

        String ID = args[1];
        ScriptManager.ModuleStatus moduleStatus = scriptManager.unload(ID);

        switch(moduleStatus) {
            case NOT_LOADED: {
                sender.sendMessage(String.format("No module with ID %s found in the memory.", ID));
                break;
            }
            case UNLOADED: {
                sender.sendMessage(String.format("Module %s successfully unloaded from the memory.", ID));
                break;
            }
        }
    }

    private void loadAll(CommandSender sender) {
        scriptManager.loadAll();
        sender.sendMessage("All the modules loaded.");
    }

    private void unloadAll(CommandSender sender) {
        scriptManager.unloadAll();
        sender.sendMessage("All the modules unloaded from the memory.");
    }

}
