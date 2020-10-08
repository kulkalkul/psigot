package com.psigot.Psigot;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Stream;

public class ScriptManager {

    public enum ModuleStatus {
        LOADED,
        UNLOADED,
        NON_EXISTENT,
        NOT_LOADED,
        DISABLED,
        ERROR
    }

    private Path dataFolder;
    private Path scriptsFolder;

    private Map<String, Path> mappedModules = new HashMap<>();
    private Map<String, Path> mappedGlobals = new HashMap<>();
    private Map<String, ScriptInstance> loadedScripts = new HashMap<>();

    private static SharedMemory sharedMemory = new SharedMemory();

    public static SharedMemory getSharedMemory() {
        return sharedMemory;
    }

    public ScriptManager() {
        dataFolder = Psigot.getInstance().getDataFolder().getAbsoluteFile().toPath();
        scriptsFolder = dataFolder.resolve("scripts");
    }

    public void mapModules(Path path) {
        try {
            Supplier<Stream<Path>> streamSupplier = () -> {
                try {
                    return Files.list(path);
                } catch (IOException e) {
                    e.printStackTrace();
                }
                return null;
            };

            boolean isModule = streamSupplier.get()
                    .anyMatch(matchedPath -> matchedPath.getFileName().toString().equals("package.json"));
            if (isModule) {
                JSONObject obj = (JSONObject) new JSONParser().parse(new FileReader(path.resolve("package.json").toFile()));

                String ID = (String) obj.get("name");
                if (obj.containsKey("global") && (boolean) obj.get("global")) mappedGlobals.put(ID, path);
                else mappedModules.put(ID, path);

            } else {
                streamSupplier.get()
                        .filter(fPath -> Files.isDirectory(fPath) && !fPath.getFileName().toString().equals("node_modules"))
                        .forEach(this::mapModules);
            }
        } catch(IOException | ParseException e) {
            e.printStackTrace();
        }
    }

    public void reMapModules() {
        mappedModules.clear();
        mapModules(scriptsFolder);
    }

    private String[] getPackageArray(JSONObject obj, String key) {
        ArrayList<String> arrayList = new ArrayList<>();
        if (obj.containsKey(key)) {
            JSONArray jsonArray = (JSONArray) obj.get(key);
            jsonArray.forEach(element -> arrayList.add(element.toString()));
        }
        return arrayList.toArray(new String[0]);
    }

    public ModuleStatus loadModule(String ID) {
        if (!mappedModules.containsKey(ID)) return ModuleStatus.NON_EXISTENT;
        Path path = mappedModules.get(ID);
        try {
            JSONObject obj = (JSONObject) new JSONParser().parse(new FileReader(path.resolve("package.json").toFile()));

            if (obj.containsKey("disabled") && (boolean) obj.get("disabled")) return ModuleStatus.DISABLED;

            String main = (String) obj.get("main");
            String[] replacements = getPackageArray(obj, "psigot-replacements");
            String[] globals = getPackageArray(obj, "globals");
            Stream<Path> globalsPath = Arrays.stream(globals).map(global -> {
                try {
                    JSONObject globalOBJ = (JSONObject) new JSONParser().parse(
                            new FileReader(mappedGlobals.get(global).resolve("package.json").toFile()
                            ));
                    String globalMain = (String) globalOBJ.get("main");
                    return mappedGlobals.get(global).resolve(globalMain);
                } catch (IOException | ParseException e) {
                    e.printStackTrace();
                }
                return mappedGlobals.get(global);
            });

            ScriptInstance scriptInstance = new ScriptInstance(ID, main, path, replacements, globalsPath);
            scriptInstance.runScript();

            loadedScripts.put(ID, scriptInstance);

            return ModuleStatus.LOADED;

        } catch (IOException | ParseException e) {
            e.printStackTrace();
        }
        return ModuleStatus.ERROR;
    }

    public ModuleStatus unloadModule(String ID) {
        if (!loadedScripts.containsKey(ID)) return ModuleStatus.NOT_LOADED;

        loadedScripts.get(ID).unregister();
        loadedScripts.get(ID).close();
        loadedScripts.remove(ID);

        return ModuleStatus.UNLOADED;
    }

    public void loadAll() {
        try {
            Files.createDirectories(dataFolder);
        } catch (IOException e) {
            e.printStackTrace();
        }

        reMapModules();
        loadedScripts.values().forEach(ScriptInstance::unregister);
        loadedScripts.clear();
        mappedModules.keySet().forEach(this::loadModule);
    }

    public void unloadAll() {
        loadedScripts.values().forEach(ScriptInstance::unregister);
        loadedScripts.clear();
    }

    public ModuleStatus load(String ID) {
        if (loadedScripts.containsKey(ID)) loadedScripts.get(ID).unregister();
        reMapModules();
        return loadModule(ID);
    }

    public ModuleStatus unload(String ID) {
        ModuleStatus result = unloadModule(ID);
        reMapModules();
        return result;
    }
}
