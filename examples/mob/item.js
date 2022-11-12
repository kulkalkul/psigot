
const psigotInstance = Polyglot.import("psigotInstance");

const Bukkit = Java.type("org.bukkit.Bukkit");
const Material = Java.type("org.bukkit.Material");
const ItemStack = Java.type("org.bukkit.inventory.ItemStack");

const NamespacedKey = Java.type("org.bukkit.NamespacedKey");
const ItemTagType = Java.type("org.bukkit.inventory.meta.tags.ItemTagType");

class ItemHelper {
  constructor(itemStack) {
    this.itemStack = itemStack;
    this.condition = null;
  }
  static fromMaterial(material, count=1) {
    const itemStack = new ItemStack(material, count);
    return new ItemHelper(itemStack);
  }
  static fromItemStack(itemStack) {
    return new ItemHelper(itemStack);
  }
  clone() {
    return ItemHelper.fromItemStack(this.itemStack.clone());
  }
  name(name) {
    const itemMeta = this.itemStack.getItemMeta();
    itemMeta.setDisplayName( util.colorize(name) );
    this.itemStack.setItemMeta(itemMeta);

    return this;
  }
  lore(...lore) {
    this.itemStack.setLore( lore.map(x => util.colorize(x)) );
    return this;
  }
  loreLine(line, value) {
    let lore;
    if (this.itemStack.getLore()) {
      lore = this.itemStack.getLore();
      lore.splice(line, 1, util.colorize(value));
    } else {
      lore = Array(line).fill("");
      lore.push(util.colorize(value));
    }
    this.itemStack.setLore(lore);
    return this;
  }
  nbt(type, name, value) {
    const namespacedKey = new NamespacedKey(psigotInstance, name);

    const itemMeta = this.itemStack.getItemMeta();
    itemMeta.getCustomTagContainer().setCustomTag(namespacedKey, type, value);
    this.itemStack.setItemMeta(itemMeta);

    return this;
  }
  hasName() {
    return this.itemStack.getItemMeta().hasDisplayName();
  }
  getName() {
    return this.itemStack.getItemMeta().getDisplayName();
  }
  getLore() {
    return this.itemStack.getLore();
  }
  getLoreLine(line) {
    const lore = this.getLore();
    if (!lore) return;
    return lore[line];
  }
  hasNBT(type, name) {
    const namespacedKey = new NamespacedKey(psigotInstance, name);
    const itemMeta = this.itemStack.getItemMeta();
    const customTagContainer = itemMeta.getCustomTagContainer();
    return customTagContainer.hasCustomTag(namespacedKey, type);
  }
  getNBT(type, name) {
    const namespacedKey = new NamespacedKey(psigotInstance, name);
    const itemMeta = this.itemStack.getItemMeta();
    const customTagContainer = itemMeta.getCustomTagContainer();
    return customTagContainer.getCustomTag(namespacedKey, type);
  }
  checkName(name) {
    if (!this.condition) return this;
    this._checkCondition(this.hasName());
    this._checkCondition(this.getName() === util.colorize(name));
    return this;
  }
  checkLore(...lore) {
    if (!this.condition) return this;
    this._checkCondition(this.itemStack.getLore());
    this._checkCondition(this.itemStack.getLore().every((x, index) => util.colorize(lore[index]) === x));
    return this;
  }
  checkLoreLine(line, value) {
    if (!this.condition) return this;
    this._checkCondition(this.itemStack.getLore());
    this._checkCondition(this.itemStack.getLore().length >= line);
    this._checkCondition(this.itemStack.getLore()[line] === util.colorize(value));
    return this;
  }
  checkLorePartial(value) {
    if (!this.condition) return this;
    this._checkCondition(this.itemStack.getLore());
    this._checkCondition(this.itemStack.getLore().some((x) => util.colorize(value) === x));
    return this;
  }
  checkNBT(type, name, value) {
    if (!this.condition) return this;
    const namespacedKey = new NamespacedKey(psigotInstance, name);
    const itemMeta = this.itemStack.getItemMeta();
    const customTagContainer = itemMeta.getCustomTagContainer();

    this._checkCondition(customTagContainer.hasCustomTag(namespacedKey, type));
    this._checkCondition(customTagContainer.getCustomTag(namespacedKey, type) === value);
    return this;
  }
  _checkCondition(condition) {
    if (condition) return;
    this.condition = false;
  }
  startCondition() {
    this.condition = true;
    return this;
  }
  endCondition() {
    return this.condition;
  }
  create() {
    return this.itemStack;
  }
}


module.exports = ItemHelper;