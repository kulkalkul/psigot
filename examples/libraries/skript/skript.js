
const skript = (() => {

  const Variables = Java.type("ch.njol.skript.variables.Variables");

  const proxyHandler = {
    get: (target, key) => {
      if (key === "$") return Variables.getVariable(target.keys.join("::"), null, false);
      return new Proxy({keys: [...target.keys, key]}, proxyHandler);
    },
    set: (target, key, value) => {
      Variables.setVariable([...target.keys, key].join("::"), value, null, false);
    }
  }

  return new Proxy({keys: []}, proxyHandler);
})()

