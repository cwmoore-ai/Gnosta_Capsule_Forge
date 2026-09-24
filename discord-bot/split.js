// Splits long text into Discord-sized parts.
// Same rules as Discord_Message_Splitter.html: cut at paragraphs first,
// then lines, then sentences, then words, and only hard-cut as a last resort.

function makeLabel(i, n) {
  return "**Part " + i + "/" + n + "**\n";
}

// Find the best place to cut text so the first piece fits in max chars.
function findCut(text, max) {
  const win = text.slice(0, max + 1);
  const minGood = Math.floor(max * 0.3);
  let i;

  i = win.lastIndexOf("\n\n", max);
  if (i >= minGood) return { cut: i, skip: 2 };

  i = win.lastIndexOf("\n", max);
  if (i >= minGood) return { cut: i, skip: 1 };

  let best = -1;
  const re = /[.!?]["')\]]*\s/g;
  let m;
  while ((m = re.exec(win)) !== null) {
    const end = m.index + m[0].length - 1; // position of the whitespace
    if (end <= max) best = end;
  }
  if (best >= minGood) return { cut: best, skip: 1 };

  i = win.lastIndexOf(" ", max);
  if (i >= minGood) return { cut: i, skip: 1 };

  // hard cut; don't split an emoji (surrogate pair) in half
  let c = max;
  const code = text.charCodeAt(c - 1);
  if (code >= 0xd800 && code <= 0xdbff) c--;
  return { cut: c, skip: 0 };
}

function splitText(text, budget) {
  const out = [];
  let rest = text;
  while (rest.length > budget) {
    const r = findCut(rest, budget);
    const piece = rest.slice(0, r.cut).replace(/\s+$/, "");
    if (piece) out.push(piece);
    rest = rest.slice(r.cut + r.skip).replace(/^\n+/, "");
  }
  if (rest.replace(/\s/g, "")) out.push(rest.replace(/\s+$/, ""));
  return out;
}

// Returns an array of strings, each at most `limit` characters.
function buildParts(text, limit = 2000, { labels = true } = {}) {
  // The label length depends on the total part count, so settle it in a loop.
  let n = 1;
  let pieces = [];
  for (let tries = 0; tries < 5; tries++) {
    const budget = limit - (labels ? makeLabel(n, n).length : 0);
    if (budget < 50) throw new Error("limit is too small");
    pieces = splitText(text, budget);
    if (String(pieces.length).length <= String(n).length) break;
    n = pieces.length;
  }

  const total = pieces.length;
  if (!labels || total < 2) return pieces;
  return pieces.map((p, idx) => makeLabel(idx + 1, total) + p);
}

module.exports = { buildParts };
