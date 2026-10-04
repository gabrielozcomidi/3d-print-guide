// The site is split into chapters so it is not one endless scroll: you see one chapter at a time.
// A chapter lists the sections (ids from index.html / copy.js) that belong together. The order here
// is the recommended reading order (and the order of the side menu and the "next chapter" links).
//
// "hero" has no menu entry of its own: it is the top of the first chapter.

export const chapters = [
  { id: "start", title: "מתחילים", sections: ["hero", "overview"] },
  { id: "machines", title: "סוגי מדפסות", sections: ["technologies", "industrial", "compare"] },
  // the six FDM motion systems live on their own page, linked from the FDM explanation
  { id: "fdm", title: "סוגי מדפסות FDM", sections: ["fdmtypes"] },
  { id: "prepare", title: "מדגם להדפסה", sections: ["workflow", "supports", "infill"] },
  { id: "materials", title: "חומרים", sections: ["materials"] },
  { id: "fix", title: "תקלות ופתרונות", sections: ["troubleshooting"] },
  { id: "choose", title: "מה לבחור", sections: ["usecases", "wizard"] },
  { id: "game", title: "משחק: יום הדפסה", sections: ["game"] },
];

/** Task-based entry points shown on the home page: what people actually come here to do. */
export const startPaths = [
  { label: "איך מדפיסים בכלל?", target: "overview" },
  { label: "איזו טכנולוגיה וחומר מתאימים לי?", target: "wizard" },
  { label: "איך מכינים דגם להדפסה?", target: "workflow" },
  { label: "ההדפסה נכשלה. מה עושים?", target: "troubleshooting" },
];
