const test = require("node:test");
const assert = require("node:assert");
const { buildParts } = require("./split");

const strip = (s) => s.replace(/\*\*Part \d+\/\d+\*\*\n/g, "").replace(/\s/g, "");

test("short text stays one part with no label", () => {
  assert.deepStrictEqual(buildParts("hello there"), ["hello there"]);
});

test("every part fits the limit and no text is lost", () => {
  const para = "The quick brown fox jumps over the lazy dog. Emoji 😀 test! ";
  const text = Array.from({ length: 80 }, (_, i) => para.repeat(1 + (i % 7))).join("\n\n")
    + "x".repeat(5000) + "😀".repeat(1500);
  for (const labels of [true, false]) {
    const parts = buildParts(text, 2000, { labels });
    assert.ok(parts.length > 1);
    for (const p of parts) assert.ok(p.length <= 2000, `part too long: ${p.length}`);
    assert.strictEqual(parts.map(strip).join(""), text.replace(/\s/g, ""));
  }
});

test("labels count up correctly", () => {
  const parts = buildParts("word ".repeat(3000), 2000);
  parts.forEach((p, i) => assert.ok(p.startsWith(`**Part ${i + 1}/${parts.length}**\n`)));
});

test("prefers paragraph breaks", () => {
  const a = "a".repeat(1500), b = "b".repeat(1500);
  assert.deepStrictEqual(buildParts(a + "\n\n" + b, 2000, { labels: false }), [a, b]);
});

test("never splits an emoji in half", () => {
  const parts = buildParts("😀".repeat(3000), 2000, { labels: false });
  for (const p of parts) assert.ok(!/[\uD800-\uDBFF]$/.test(p) && !/^[\uDC00-\uDFFF]/.test(p));
});
