// Run inside a reference page (browser JavaScript tool, or paste into DevTools console).
// Returns the page's design tokens weighted by how much of the screen they cover:
// background/text/border colours, font stacks, heading typography, sizes, radii, shadows,
// and CSS custom properties declared on :root/html/body (often the site's own token set).
// It only reads computed styles; it downloads nothing and changes nothing.
(() => {
  const visible = [...document.querySelectorAll("body, body *")].filter((el) => {
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  }).slice(0, 5000);
  const tally = (map, key, weight = 1) => key && map.set(key, (map.get(key) || 0) + weight);
  const clear = (colour) => !colour || colour === "transparent" || /rgba?\([^)]*[,/]\s*0\)$/.test(colour);
  const maps = { backgrounds: new Map(), text: new Map(), borders: new Map(), fonts: new Map(), headings: new Map(), fontSizes: new Map(), weights: new Map(), radii: new Map(), shadows: new Map(), letterSpacing: new Map() };
  const screen = innerWidth * innerHeight;

  for (const el of visible) {
    const style = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    if (!clear(style.backgroundColor)) tally(maps.backgrounds, style.backgroundColor, Math.min(box.width * box.height, screen) / 1000);
    if (style.backgroundImage !== "none" && /gradient/.test(style.backgroundImage)) tally(maps.backgrounds, style.backgroundImage.slice(0, 160), box.width * box.height / 2000);
    const ownText = [...el.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent.trim()).join("");
    if (ownText) {
      const weight = ownText.length;
      tally(maps.text, style.color, weight);
      tally(maps.fonts, style.fontFamily, weight);
      tally(maps.fontSizes, style.fontSize, weight);
      tally(maps.weights, style.fontWeight, weight);
      tally(maps.letterSpacing, style.letterSpacing, weight);
      if (/^H[1-3]$/.test(el.tagName) || parseFloat(style.fontSize) >= 28) {
        tally(maps.headings, `${style.fontFamily} · ${style.fontWeight} · ${style.fontSize} · ls ${style.letterSpacing} · lh ${style.lineHeight}`, weight);
      }
    }
    if (parseFloat(style.borderTopWidth) > 0 && !clear(style.borderTopColor)) tally(maps.borders, `${style.borderTopWidth} ${style.borderTopColor}`);
    if (style.borderRadius !== "0px") tally(maps.radii, style.borderRadius);
    if (style.boxShadow !== "none") tally(maps.shadows, style.boxShadow);
  }

  const top = (map, count = 8) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, count).map(([value, weight]) => ({ value, weight: Math.round(weight) }));
  const variables = {};
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; } // cross-origin sheets cannot be read
    for (const rule of rules) {
      if (!rule.style || !/(^|,|\s)(:root|html|body)\b/.test(rule.selectorText || "")) continue;
      for (const name of rule.style) if (name.startsWith("--") && Object.keys(variables).length < 150) variables[name] = rule.style.getPropertyValue(name).trim();
    }
  }
  const root = getComputedStyle(document.documentElement);
  const body = getComputedStyle(document.body);
  return {
    url: location.href,
    title: document.title,
    page: { background: body.backgroundColor, color: body.color, colorScheme: root.colorScheme, font: body.fontFamily, size: body.fontSize, lineHeight: body.lineHeight },
    backgrounds: top(maps.backgrounds),
    text: top(maps.text),
    borders: top(maps.borders, 5),
    fonts: top(maps.fonts, 5),
    headings: top(maps.headings, 6),
    fontSizes: top(maps.fontSizes, 10),
    weights: top(maps.weights, 5),
    letterSpacing: top(maps.letterSpacing, 4),
    radii: top(maps.radii, 6),
    shadows: top(maps.shadows, 4),
    cssVariables: variables,
  };
})();
