import config from "@/config";

/** "17 Oct 2026", in the given zone (or the site's), not the build machine's. */
export const formatDate = (date: Date, timeZone = config.site.timezone) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  }).format(date);
