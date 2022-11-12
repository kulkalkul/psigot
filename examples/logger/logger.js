
class Logger {
  constructor(namespace) {
    this.namespace = namespace;
    persist.init(namespace, persist.object);
  }
  get persisted() {
    return persist.get()[this.namespace]
  }
  createDomain(key, type) {
    return new Domain(key, persist.get()[this.namespace], type)
  }
}

class Domain {
  constructor(key, persisted, type) {
    if (!persisted[key]) persisted[key] = type;
    this.persistedObject = persisted[key];
  }
  get persisted() {
    return this.persistedObject;
  }
  createDomain(key, type) {
    return new Domain(key, this.persistedObject, type);
  }
}

module.exports = Logger;
