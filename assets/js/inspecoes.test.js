const assert = require("assert");
const fs = require("fs");
const path = require("path");

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/inspecoes.json"), "utf8")
);

assert.ok(data.categorias.length >= 8, "categorias");
assert.ok(data.eixos.length >= 5, "eixos");
assert.ok(data.itens.length >= 25, "itens");

const catIds = new Set(data.categorias.map((c) => c.id));
const eixoIds = new Set(data.eixos.map((e) => e.id));
const itemIds = new Set(data.itens.map((i) => i.id));

data.itens.forEach((item) => {
  assert.ok(item.id && item.titulo && item.href, item.id);
  assert.ok(item.categorias.length, item.id + " sem categoria");
  item.categorias.forEach((id) => {
    assert.ok(catIds.has(id), item.id + " cat " + id);
  });
  item.eixos.forEach((id) => {
    assert.ok(eixoIds.has(id), item.id + " eixo " + id);
  });
  (item.rel || []).forEach((id) => {
    assert.ok(itemIds.has(id), item.id + " rel missing " + id);
  });
  const html = path.join(__dirname, "../../pesquisas", item.href);
  assert.ok(fs.existsSync(html), "missing " + item.href);
});

const js = fs.readFileSync(path.join(__dirname, "inspecoes.js"), "utf8");
assert.ok(js.includes("data-inspecoes-hub"));
assert.ok(js.includes("data-inspecao"));

console.log("inspecoes ok", data.itens.length);
