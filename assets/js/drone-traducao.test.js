const assert = require("assert");
const drone = require("./drone-traducao.js");

assert.strictEqual(drone.otherLang("pt", "pt", "en"), "en");
assert.strictEqual(drone.otherLang("en", "pt", "en"), "pt");

assert.strictEqual(drone.guessLang("gift", "pt", "en"), "en");
assert.strictEqual(drone.guessLang("vida", "pt", "en"), "pt");
assert.strictEqual(drone.guessLang("hello", "pt", "en"), "en");
assert.strictEqual(drone.guessLang("olá", "pt", "en"), "pt");
assert.strictEqual(drone.guessLang("life", "pt", "en"), "en");

const enToPt = drone.route("life", "pt", "en");
assert.ok(enToPt);
assert.strictEqual(enToPt.from, "en");
assert.strictEqual(enToPt.to, "pt");
assert.strictEqual(enToPt.out, "vida");

const ptToEn = drone.route("vida", "pt", "en");
assert.ok(ptToEn);
assert.strictEqual(ptToEn.from, "pt");
assert.strictEqual(ptToEn.to, "en");
assert.strictEqual(ptToEn.out, "life");

const gift = drone.route("gift", "pt", "en");
assert.strictEqual(gift.from, "en");
assert.strictEqual(gift.to, "pt");
assert.ok(gift.out.includes("presente"));

const presente = drone.route("presente", "en", "pt");
assert.strictEqual(presente.from, "pt");
assert.strictEqual(presente.to, "en");
assert.strictEqual(presente.out, "gift");

const hello = drone.route("hello", "pt", "en");
assert.strictEqual(hello.to, "pt");
assert.strictEqual(hello.out, "olá");

const ola = drone.route("olá", "pt", "en");
assert.strictEqual(ola.to, "en");
assert.strictEqual(ola.out, "hello");

const winter = drone.route("winter", "pt", "en");
assert.strictEqual(winter.from, "en");
assert.strictEqual(winter.to, "pt");
assert.strictEqual(winter.out, "inverno");

const inverno = drone.route("inverno", "pt", "en");
assert.strictEqual(inverno.from, "pt");
assert.strictEqual(inverno.to, "en");
assert.strictEqual(inverno.out, "winter");

const champion = drone.route("champion", "pt", "en");
assert.strictEqual(champion.to, "pt");
assert.strictEqual(champion.out, "campeão");

console.log("drone ok");
