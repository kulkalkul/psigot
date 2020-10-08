package com.psigot.Psigot.persist;

import com.psigot.Psigot.SharedMemory;
import org.graalvm.polyglot.Value;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

public class Persistence {

    private PersistedObject persistedObject;
    private Serializer serializer;
    private Deserializer deserializer;

    private static final Map<String, Object> typeNameMap = Map.of(
            "java.util.HashMap", "hashmap",
            "java.util.ArrayList", "arraylist",
            "java.util.UUID", "uuid",
            "org.bukkit.Location", "location"
    );

    public Persistence(Path path) {
        serializer = new Serializer(path);
        deserializer = new Deserializer(path, this);
        persistedObject = deserializer.deserialize();
    }

    public PersistedObject getPersisted() {
        return persistedObject;
    }

    public void reload() {
        persistedObject = deserializer.deserialize();
    }

    void update() {
        serializer.serialize(persistedObject);
    }

    public PersistedObject createObject() {
        return new PersistedObject();
    }
    protected PersistedObject createObject(Map<String, Object> map) {
        return new PersistedObject(map);
    }

    public PersistedArray createArray() {
        return new PersistedArray();
    }
    protected PersistedArray createArray(List<Object> list) {
        return new PersistedArray(list);
    }

    protected class PersistedObject extends SharedMemory.SharedObject {

        public PersistedObject() {
            super();
        }
        public PersistedObject(Map<String, Object> map) {
            super(map);
        }

        @Override
        public void putMember(String key, Value value) {
            super.putMember(key, value);
            update();
        }

        @Override
        public boolean removeMember(String key) {
            boolean result = super.removeMember(key);
            update();
            return result;
        }
    }

    protected class PersistedArray extends SharedMemory.SharedArray {

        public PersistedArray() {
            super();
        }
        public PersistedArray(List<Object> list) {
            super(list);
        }

        @Override
        public void set(long index, Value value) {
            super.set(index, value);
            update();
        }

        @Override
        public boolean remove(long index) {
            boolean result = super.remove(index);
            update();
            return result;
        }
    }
}
