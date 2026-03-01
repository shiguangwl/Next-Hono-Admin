import { useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { useCallback } from "react";

export function useTheme() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");

  const toggleTheme = useCallback(() => {
    setColorScheme(computedColorScheme === "light" ? "dark" : "light");
  }, [computedColorScheme, setColorScheme]);

  return {
    theme: colorScheme,
    resolvedTheme: computedColorScheme,
    setTheme: setColorScheme,
    toggleTheme,
    isDark: computedColorScheme === "dark",
  };
}
