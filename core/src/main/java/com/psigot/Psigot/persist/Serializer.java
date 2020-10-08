package com.psigot.Psigot.persist;

import com.cedarsoftware.util.io.JsonWriter;
import org.graalvm.polyglot.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

class Serializer {

    private Path path;

    protected Serializer(Path path) {
        this.path = path;
    }

    protected void serialize(Persistence.PersistedObject persistedObject) {
        Map <String, Object> constructedMaps = constructMaps(persistedObject);
//        String json = JsonWriter.objectToJson(constructedMaps, Map.of(
//                JsonWriter.SHORT_META_KEYS, true,
//                JsonWriter.TYPE_NAME_MAP, typeNameMap
//        ));
        String json = JsonWriter.objectToJson(constructedMaps);
        try {
            Files.writeString(path, json);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private Map<String, Object> constructMaps(Persistence.PersistedObject persistedObject) {
        return persistedObject.getMap().entrySet().stream().collect(
                Collectors.toMap(
                        Map.Entry::getKey,
                        data -> {
                            Value value = (Value) data.getValue();
                            if (value.isBoolean()) return value.asBoolean();
                            if (value.isDate()) return value.asDate();
                            if (value.isDuration()) return value.asDuration();
                            if (value.isHostObject()) return value.asHostObject();
                            if (value.isInstant()) return value.asInstant();
                            if (value.isNativePointer()) return value.asNativePointer();
                            if (value.isNull()) return null;
                            if (value.isNumber()) return value.asLong();
                            if (value.isString()) return value.asString();
                            if (value.isTime()) return value.asTime();
                            if (value.isTimeZone()) return value.asTimeZone();
                            if (value.asProxyObject() instanceof Persistence.PersistedArray)
                                return constructMapsArray(value.asProxyObject());

                            return constructMaps(value.asProxyObject());
                        }
                )
        );
    }
    private List<Object> constructMapsArray(Persistence.PersistedArray persistedArray) {
        return persistedArray.getList().stream().map(data -> {
            Value value = (Value) data;
            if (value.isBoolean()) return value.asBoolean();
            if (value.isDate()) return value.asDate();
            if (value.isDuration()) return value.asDuration();
            if (value.isHostObject()) return value.asHostObject();
            if (value.isInstant()) return value.asInstant();
            if (value.isNativePointer()) return value.asNativePointer();
            if (value.isNull()) return null;
            if (value.isNumber()) return value.asLong();
            if (value.isString()) return value.asString();
            if (value.isTime()) return value.asTime();
            if (value.isTimeZone()) return value.asTimeZone();
            if (value.asProxyObject() instanceof Persistence.PersistedArray)
                return constructMapsArray(value.asProxyObject());

            return constructMaps(value.asProxyObject());
        }).collect(Collectors.toCollection(ArrayList::new));
    }


}
