"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "pink";

const THEME_KEY = "ideabank_theme";

const THEMES: { value: Theme; icon: React.ElementType; label: string }[] = [
  { value: "light", icon: Sun, label: "Marshmallow" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "pink", icon: Heart, label: "Pink" },
];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved && ["light", "dark", "pink"].includes(saved)) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const handleChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-full">
      {THEMES.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => handleChange(value)}
          aria-label={`${label} 테마`}
          aria-pressed={theme === value}
          className={cn(
            "flex items-center justify-center size-8 rounded-full transition-all",
            theme === value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove("dark", "pink");
  if (theme !== "light") {
    html.classList.add(theme);
  }
}
