package com.psigot.Psigot;

import com.psigot.Psigot.persist.Persistence;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandMap;
import org.bukkit.command.SimpleCommandMap;
import org.bukkit.event.Event;
import org.bukkit.event.EventPriority;
import org.bukkit.event.HandlerList;
import org.bukkit.event.Listener;
import org.bukkit.plugin.EventExecutor;
import org.bukkit.scheduler.BukkitTask;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.HostAccess;
import org.graalvm.polyglot.PolyglotException;
import org.graalvm.polyglot.Source;

import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ScriptInstance {

    private String ID;
    private Path path;
    private Stream<Path> globals;

    private Listener listener = new Listener() {};
    private ArrayList<String> loadedCommands = new ArrayList<>();
    private Map<String, Command> disabledCommands = new HashMap<>();
    private ArrayList<BukkitTask> bukkitTasks = new ArrayList<>();

    private Context context;
    private Persistence persistence;

    public ScriptInstance(String ID, String main, Path path, String[] replacements, Stream<Path> globals) {
        this.ID = ID;
        this.path = path.resolve(main);
        this.globals = globals;
        this.persistence = new Persistence(path.resolve("persisted.json"));

        Map<String, String> options = new HashMap<>();
        options.put("js.commonjs-require", "true");
        options.put("js.commonjs-require-cwd", path.toString());
        options.put("js.experimental-foreign-object-prototype", "true");
        options.put("js.nashorn-compat", "true");
        if (replacements.length != 0) {
            options.put("js.commonjs-core-modules-replacements",
                    Arrays.stream(replacements).reduce(null, (acc, cur) -> {
                        if (acc == null) return cur;
                        return String.join(acc, cur);
                    })
            );
        }



        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader(Psigot.getInstance().getClass().getClassLoader());

        HostAccess hostAccess = HostAccess.newBuilder(HostAccess.ALL)
                .targetTypeMapping(Double.class, Float.class, null, Double::floatValue)
                .targetTypeMapping(Double.class, Integer.class, null, Double::intValue)
                .build();

        context = Context.newBuilder("js")
                .allowExperimentalOptions(true)
                .allowAllAccess(true)
                .allowHostAccess(hostAccess)
                .allowHostClassLoading(true)
                .allowHostClassLookup(s -> true)
                .options(options)
                .build();

        Thread.currentThread().setContextClassLoader(classLoader);

        context.getPolyglotBindings().putMember("psigotInstance", Psigot.getInstance());
        context.getPolyglotBindings().putMember("scriptInstance", this);
    }

    private void eval(Path path) {
        try {
            Source source = Source.newBuilder("js", path.toFile()).build();
            context.eval(source);
        } catch (IOException | PolyglotException e) {
            e.printStackTrace();
        }
    }

    public void close() {
        context.close();
    }

    public void runScript() {
        globals.forEach(this::eval);
        eval(path);
    }

    public void unregister() {
        unregisterSchedulers();
        unregisterEvents();
        unregisterCommands();
    }

    @SuppressWarnings("unchecked")
    private HashMap<String, Command> constructKnownCommands(CommandMap commandMap) {
        try {
            Field knownCommandsField = SimpleCommandMap.class.getDeclaredField("knownCommands");

            knownCommandsField.setAccessible(true);
            HashMap<String, Command> knownCommands = (HashMap<String, Command>) knownCommandsField.get(commandMap);
            knownCommandsField.setAccessible(false);
            return knownCommands;
        } catch (IllegalAccessException | NoSuchFieldException e) {
            e.printStackTrace();
            return new HashMap<>();
        }
    }

    private void unregisterCommand(HashMap<String, Command> knownCommands, String ID) {
        if (!knownCommands.containsKey(ID)) return;
        knownCommands.remove(ID);

        String nameSpacedCommand = this.ID + ":" + ID;
        if (!knownCommands.containsKey(nameSpacedCommand)) return;
        knownCommands.remove(nameSpacedCommand);
    }

    public void registerEvent(Class<? extends Event> eventClass, EventExecutor executor) {
        Bukkit.getPluginManager().registerEvent(eventClass, listener, EventPriority.NORMAL, executor,
                Psigot.getInstance());
    }
    public void registerEvent(Class<? extends Event> eventClass, EventPriority priority, EventExecutor executor) {
        Bukkit.getPluginManager().registerEvent(eventClass, listener, priority, executor,
                Psigot.getInstance());
    }

    public void unregisterScheduler(BukkitTask bukkitTask) {
        bukkitTask.cancel();
        bukkitTasks.remove(bukkitTask);
    }

    public void unregisterSchedulers() {
        bukkitTasks.forEach(BukkitTask::cancel);
        bukkitTasks.clear();
    }

    public void registerScheduler(BukkitTask bukkitTask) {
        bukkitTasks.add(bukkitTask);
    }

    public void unregisterEvents() {
        HandlerList.unregisterAll(listener);
    }

    public void registerCommand(String ID, Command command) {
        ID = ID.toLowerCase();
        CommandMap commandMap = Bukkit.getCommandMap();
        HashMap<String, Command> knownCommands = constructKnownCommands(commandMap);

        List<String> allAliases = command.getAliases();
        allAliases.add(ID);
        allAliases.forEach(commandID -> {
            if (!knownCommands.containsKey(commandID)) return;
            Command disabledCommand = knownCommands.get(commandID);
            this.unregisterCommand(knownCommands, commandID);
            disabledCommands.put(commandID, disabledCommand);
        });

        commandMap.register(this.ID, command);
        loadedCommands.add(ID);

        UseNMS.syncCommands();
    }

    public void unregisterCommands() {
        CommandMap commandMap = Bukkit.getCommandMap();
        HashMap<String, Command> knownCommands = constructKnownCommands(commandMap);

        ArrayList<String> allCommands = (ArrayList<String>) loadedCommands.stream().flatMap(command -> {
            List<String> aliases = commandMap.getCommand(command).getAliases();
            aliases.add(command);
            return aliases.stream();
        }).collect(Collectors.toList());

        allCommands.forEach(commandID -> {
            this.unregisterCommand(knownCommands, commandID);
            if (!disabledCommands.containsKey(commandID)) return;
            knownCommands.put(commandID, disabledCommands.get(commandID));
            disabledCommands.remove(commandID);
        });

        UseNMS.syncCommands();
        loadedCommands.clear();
    }

    public SharedMemory getSharedMemory() {
        return ScriptManager.getSharedMemory();
    }
    public Persistence getPersistence() {
        return persistence;
    }
}
