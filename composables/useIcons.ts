import { icons as heroiconsData } from "@iconify-json/heroicons/icons.json";
import { icons as lucideData } from "@iconify-json/lucide/icons.json";
import { ref } from "vue";

export function useIcons() {
  const heroicons = Object.keys(heroiconsData).map((name) =>
    name.replace(/^ic-/, ""),
  );

  const lucide = Object.keys(lucideData).map((name) =>
    name.replace(/^ic-/, ""),
  );

  const allIcons = ref({
    "i-heroicons": heroicons,
    "i-lucide": lucide,
  });

  return {
    heroicons,
    lucide,
    allIcons,
  };
}
