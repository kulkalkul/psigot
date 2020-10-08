package com.psigot.Psigot;

import com.psigot.Psigot.nms.SharedNMS;
import org.bukkit.Bukkit;

import java.lang.reflect.InvocationTargetException;

public class UseNMS {

    static SharedNMS sharedNMS;

    static {
        try {
            String packageName = SharedNMS.class.getPackage().getName();
            String internalsName = Bukkit.getServer().getClass().getPackage().getName().split("\\.")[3];
            sharedNMS = (SharedNMS) Class.forName(packageName + ".sharedNMS_" + internalsName.substring(1))
                    .getConstructor().newInstance();
        } catch (InstantiationException | ClassNotFoundException | IllegalAccessException | NoSuchMethodException |
                InvocationTargetException e) {
            e.printStackTrace();
        }
    }

    public static void syncCommands() {
        sharedNMS.syncCommands();
    }
}
