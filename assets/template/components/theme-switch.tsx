"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { MODE_KEY, THEME_KEY, themes } from "@/lib/themes";

// Lets the audience see the product in any ready-made theme. The choice is remembered per browser.
export function ThemeSwitch() {
  const [theme, setTheme] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the boot script set these before hydration
    setTheme(document.documentElement.dataset.theme ?? "");
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const save = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Theme choice is cosmetic; it just will not survive a reload.
    }
  };

  const pick = (id: string) => {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    save(THEME_KEY, id);
  };

  const toggleMode = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    save(MODE_KEY, next ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-1">
      <select
        aria-label="Theme"
        value={theme}
        onChange={(event) => pick(event.target.value)}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
      >
        {themes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <button type="button" aria-label="Toggle dark mode" onClick={toggleMode} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
        {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
      </button>
    </div>
  );
}
