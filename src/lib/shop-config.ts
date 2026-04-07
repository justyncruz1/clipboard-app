/**
 * Shop Configuration
 *
 * Each Lyfework client gets a config entry here.
 * This maps their booking page slug to their GHL setup + branding.
 *
 * To add a new client:
 * 1. Add their config below
 * 2. Set up their GHL calendar with services + team members
 * 3. Their booking page is instantly live at /book/[slug]
 */

export interface ShopConfig {
  slug: string;
  name: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  timezone: string;

  // GHL IDs
  ghlCalendarId: string;
  ghlLocationId?: string; // if different from default

  // Branding
  brand: {
    primary: string;     // main accent color
    background: string;  // page background
    surface: string;     // card backgrounds
    text: string;        // primary text
    textMuted: string;   // secondary text
  };

  // Social
  facebook?: string;
  instagram?: string;
  website?: string;

  // Staff display names (mapped from GHL user IDs)
  staffNames?: Record<string, string>;

  // Services (pulled from GHL calendar, but we can override display)
  serviceCategories?: Record<string, string[]>;
}

// ============================================
// CLIENT CONFIGS
// ============================================

const shops: Record<string, ShopConfig> = {
  "the-spot": {
    slug: "the-spot",
    name: "The Spot Barbershop",
    phone: "561-429-3732",
    address: {
      line1: "4618 S. Jog Rd.",
      city: "Greenacres",
      state: "FL",
      zip: "33467",
    },
    timezone: "America/New_York",

    // TODO: Replace with actual GHL calendar ID
    ghlCalendarId: "REPLACE_WITH_GHL_CALENDAR_ID",

    brand: {
      primary: "#CC0000",
      background: "#0A0A0A",
      surface: "#18181B",
      text: "#FFFFFF",
      textMuted: "#A1A1AA",
    },

    facebook: "https://www.facebook.com/thespotbarbershopwpb/",

    staffNames: {
      // "ghl-user-id": "Display Name"
      // Will be populated once GHL is connected
    },
  },

  // ============================================
  // ADD MORE LYFEWORK CLIENTS HERE
  // ============================================
  // "basis-medical": {
  //   slug: "basis-medical",
  //   name: "Basis Medical",
  //   phone: "561-555-0000",
  //   ...
  // },
};

export function getShopConfig(slug: string): ShopConfig | null {
  return shops[slug] || null;
}

export function getAllShopSlugs(): string[] {
  return Object.keys(shops);
}
