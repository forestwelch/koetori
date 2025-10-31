/**
 * Platform name mappings to shorter, standardized names
 */
export const PLATFORM_MAPPINGS: Record<string, string> = {
  // PC variants
  "PC (Microsoft Windows)": "PC",
  "Microsoft Windows": "PC",
  Windows: "PC",
  "Windows PC": "PC",

  // PlayStation
  PlayStation: "PSX",
  "PlayStation 5": "PS5",
  "PlayStation 4": "PS4",
  "PlayStation 3": "PS3",
  "PlayStation 2": "PS2",
  "PlayStation Portable": "PSP",
  "PlayStation Vita": "PS Vita",

  // Xbox
  "Xbox Series X|S": "Xbox Series X/S",
  "Xbox One": "Xbox One",
  "Xbox 360": "Xbox 360",
  Xbox: "Xbox",

  // Nintendo
  "Nintendo Switch": "Switch",
  "Nintendo 3DS": "3DS",
  "Nintendo DS": "DS",
  "Wii U": "Wii U",
  Wii: "Wii",
  "Game Boy Advance": "GBA",
  "Game Boy Color": "GBC",
  "Game Boy": "GB",

  // Apple
  iOS: "iOS",
  iPadOS: "iPadOS",
  macOS: "macOS",
  "Apple TV": "Apple TV",

  // Google
  Android: "Android",
  "Google Stadia": "Stadia",

  // Other
  Linux: "Linux",
  Steam: "Steam",
  "Epic Games Store": "Epic",
};

/**
 * Normalize platform names to shorter versions
 */
export function normalizePlatformName(platform: string): string {
  // Exact match first
  if (PLATFORM_MAPPINGS[platform]) {
    return PLATFORM_MAPPINGS[platform];
  }

  // Check case-insensitive match
  const lowerPlatform = platform.toLowerCase();
  for (const [key, value] of Object.entries(PLATFORM_MAPPINGS)) {
    if (key.toLowerCase() === lowerPlatform) {
      return value;
    }
  }

  // Check if platform contains a known key
  for (const [key, value] of Object.entries(PLATFORM_MAPPINGS)) {
    if (lowerPlatform.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Return original if no match
  return platform;
}

/**
 * Normalize an array of platform names
 */
export function normalizePlatformNames(platforms: string[]): string[] {
  return platforms.map(normalizePlatformName);
}
