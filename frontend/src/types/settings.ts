export type DashboardSettings = {
  /** Inclusive start of timeline range (YYYY-MM-DD) */
  rangeStart: string;
  /** Inclusive end of timeline range (YYYY-MM-DD) */
  rangeEnd: string;
  siteTitle: string;
  liveEnabled: boolean;
  defaultView: "timeline" | "week" | "month";
  showEnemySection: boolean;
  showGovernmentSection: boolean;
  timezoneLabel: string;
};

export const defaultDashboardSettings: DashboardSettings = {
  rangeStart: "",
  rangeEnd: "",
  siteTitle: "تقویم دفاعی",
  liveEnabled: true,
  defaultView: "timeline",
  showEnemySection: true,
  showGovernmentSection: true,
  timezoneLabel: "Asia/Tehran",
};
