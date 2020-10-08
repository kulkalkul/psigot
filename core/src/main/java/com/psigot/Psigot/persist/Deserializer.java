package com.psigot.Psigot.persist;

import com.cedarsoftware.util.io.JsonReader;
import org.graalvm.polyglot.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

class Deserializer {

    private Path path;
    private Persistence persistence;

    protected Deserializer(Path path, Persistence persistence) {
        this.path = path;
        this.persistence = persistence;
    }

    @SuppressWarnings("unchecked")
    protected Persistence.PersistedObject deserialize() {
        if (!Files.exists(path)) return persistence.createObject();
        try {
            String json = Files.readString(path);
            if (json.isEmpty() || json.isBlank()) return persistence.createObject();

            Map<String, Object> map = (Map<String, Object>) JsonReader.jsonToJava(json);

            return constructObject(map);

        } catch (IOException e) {
            e.printStackTrace();
        }
        return persistence.createObject();
    }

    @SuppressWarnings("unchecked")
    private Object constructObjects(Object object) {
        if (object instanceof List) object = constructArray((List<Object>) object);
        if (object instanceof Map) object = constructObject((Map<String, Object>) object);
        return Value.asValue(object);
    }

    private Persistence.PersistedArray constructArray(List<Object> list) {
        return persistence.createArray(list.stream().map(this::constructObjects).collect(Collectors.toList()));
    }

    private Persistence.PersistedObject constructObject(Map<String, Object> map) {
        return persistence.createObject(map.entrySet().stream().collect(
                Collectors.toMap(Map.Entry::getKey, data -> constructObjects(data.getValue()))
        ));
    }
}
