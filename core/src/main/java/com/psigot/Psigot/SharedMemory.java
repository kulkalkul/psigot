package com.psigot.Psigot;

import org.graalvm.polyglot.Value;
import org.graalvm.polyglot.proxy.ProxyArray;
import org.graalvm.polyglot.proxy.ProxyObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SharedMemory {

    private Map<String, Object> sharedMemory = new HashMap<>();

    public Object get(String key) {
        return sharedMemory.get(key);
    }

    public void set(String key, Object value) {
        sharedMemory.put(key, value);
    }

    public void remove(String key) {
        sharedMemory.remove(key);
    }

    public SharedObject createObject() {
        return new SharedObject();
    }

    public SharedArray createArray() {
        return new SharedArray();
    }

    public static class SharedObject implements ProxyObject {

        private Map<String, Object> map;

        public SharedObject() {
            map = new HashMap<>();
        }
        public SharedObject(Map<String, Object> map) {
            this.map = map;
        }

        @Override
        public Object getMember(String key) {
            return map.get(key);
        }

        @Override
        public Object getMemberKeys() {
            return map.keySet().toArray();
        }

        @Override
        public boolean hasMember(String key) {
            return map.containsKey(key);
        }

        @Override
        public void putMember(String key, Value value) {
            map.put(key, value);
        }

        @Override
        public boolean removeMember(String key) {
            return (boolean) map.remove(key);
        }

        public Map<String, Object> getMap() {
            return map;
        }
    }

    public static class SharedArray implements ProxyArray {

        private List<Object> list;

        public SharedArray() {
            list = new ArrayList<>();
        }
        public SharedArray(List<Object> list) {
            this.list = list;
        }

        @Override
        public Object get(long index) {
            return list.get((int) index);
        }

        @Override
        public void set(long index, Value value) {
            if (index >= list.size()) {
                list.add(value);
                return;
            }
            list.set((int) index, value);
        }

        @Override
        public boolean remove(long index) {
            return (boolean) list.remove((int) index);
        }

        @Override
        public long getSize() {
            return list.size();
        }

        public List<Object> getList() {
            return list;
        }
    }

}
