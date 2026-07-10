import {
  defaultDashboardSettings,
  type DashboardSettings,
} from "@/types/settings";
import { getDashboardSettings } from "@/lib/admin-store";

export const SITE_TITLE = defaultDashboardSettings.siteTitle;
export const SITE_TAGLINE = defaultDashboardSettings.siteTagline;

export function getSiteBranding(): Pick<
  DashboardSettings,
  "siteTitle" | "siteTagline"
> {
  if (typeof window === "undefined") {
    return {
      siteTitle: SITE_TITLE,
      siteTagline: SITE_TAGLINE,
    };
  }

  const settings = getDashboardSettings();
  return {
    siteTitle: settings.siteTitle?.trim() || SITE_TITLE,
    siteTagline: settings.siteTagline?.trim() || SITE_TAGLINE,
  };
}
