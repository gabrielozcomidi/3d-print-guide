// Common slicers. Edit freely.
//
// Facts were checked against official project pages and repositories in October 2026 (research pass
// for milestone M7). Deliberately NOT included, because they change often or could not be confirmed:
// version numbers, prices, and slicers whose features could not be verified (Simplify3D, ideaMaker).
// Licence TYPE only (open-source / free / freemium), never prices.
//
// Fields:
//   group     fdm | resin
//   license   open-source | free | freemium      licenseNote: the exact licence when open-source
//   lineage   short note when the slicer is a fork of another
//   features  (fdm only) yes | partial | no for each key in `featureColumns`
//   output    (resin only) file formats the slicer writes
//
// `partial` means the feature exists in a limited form (see the note next to the slicer).

export const featureColumns = [
  { key: "tree", label: "Tree supports" },
  { key: "paint", label: "Paint-on supports" },
  { key: "varLayer", label: "Variable layer height" },
  { key: "calibration", label: "Calibration tools" },
  { key: "multi", label: "Multi-material" },
  { key: "plugins", label: "Plugins" },
  { key: "remote", label: "Remote send" },
];

export const licenseLabel = {
  "open-source": "קוד פתוח",
  free: "חינמי (קוד סגור)",
  freemium: "גרסה חינמית ורמות מתקדמות",
};

export const slicers = [
  {
    id: "cura",
    group: "fdm",
    name: "Cura",
    maker: "UltiMaker",
    license: "open-source",
    licenseNote: "LGPL-3.0",
    platforms: "Windows, macOS, Linux",
    features: { tree: "yes", paint: "partial", varLayer: "partial", calibration: "partial", multi: "yes", plugins: "yes", remote: "partial" },
    featureNotes: "ציור תמיכות נמצא בשלבי פיתוח, גובה שכבה משתנה הוא adaptive layers, וכלי כיול מגיעים בעיקר דרך תוספים.",
    knownFor: ["מאגר ענק של פרופילים מהקהילה", "מאות הגדרות ומנוע חיתוך (CuraEngine) שבשימוש רחב", "תוספים דרך Marketplace"],
    suits: "מתחילים עד חובבים",
  },
  {
    id: "prusaslicer",
    group: "fdm",
    name: "PrusaSlicer",
    maker: "Prusa Research",
    license: "open-source",
    licenseNote: "AGPL-3.0",
    platforms: "Windows, macOS, Linux",
    lineage: "ממשיך של Slic3r",
    features: { tree: "yes", paint: "yes", varLayer: "yes", calibration: "partial", multi: "yes", plugins: "no", remote: "yes" },
    featureNotes: "כיול: אובייקטי כיול מובנים בלי חבילה מלאה של כלי כיול.",
    knownFor: ["גובה שכבה משתנה וכלי ציור תמיכות", "מצב נוסף למדפסות שרף (mSLA)", "הבסיס שממנו נוצרו כמה סלייסרים אחרים"],
    suits: "חובבים עד מקצוענים",
  },
  {
    id: "orcaslicer",
    group: "fdm",
    name: "OrcaSlicer",
    maker: "קהילה (SoftFever ומתנדבים)",
    license: "open-source",
    licenseNote: "AGPL-3.0",
    platforms: "Windows, macOS, Linux",
    lineage: "פורק של Bambu Studio",
    features: { tree: "yes", paint: "yes", varLayer: "yes", calibration: "yes", multi: "yes", plugins: "no", remote: "yes" },
    knownFor: ["כלי כיול מובנים (זרימה, טמפרטורה ועוד)", "פרופילים לכמה יצרנים באפליקציה אחת", "שליחה למדפסות Klipper, OctoPrint ו־PrusaLink"],
    suits: "חובבים עד מקצוענים",
  },
  {
    id: "bambustudio",
    group: "fdm",
    name: "Bambu Studio",
    maker: "Bambu Lab",
    license: "open-source",
    licenseNote: "AGPL-3.0",
    platforms: "Windows, macOS, Linux",
    lineage: "נגזר מ־PrusaSlicer",
    features: { tree: "yes", paint: "yes", varLayer: "yes", calibration: "partial", multi: "yes", plugins: "no", remote: "yes" },
    featureNotes: "כיול: כיול אוטומטי מול המדפסת ומסכי כיול זרימה.",
    knownFor: ["שילוב הדוק עם מדפסות Bambu Lab ועם MakerWorld", "עבודה בפרויקט עם כמה פלטות", "מערכת AMS להדפסה רב־צבעית"],
    suits: "מתחילים עד חובבים",
  },

  // ---- resin ----
  {
    id: "chitubox",
    group: "resin",
    name: "Chitubox",
    maker: "CBD-Tech",
    license: "freemium",
    platforms: "Windows, macOS",
    output: [".ctb", ".cbddlp"],
    knownFor: ["הסלייסר הנפוץ ביותר למדפסות שרף ביתיות", "תמיכה במדפסות רבות", "תמיכות אוטומטיות וידניות"],
    suits: "מתחילים עד חובבים",
  },
  {
    id: "lychee",
    group: "resin",
    name: "Lychee Slicer",
    maker: "Mango 3D",
    license: "freemium",
    platforms: "Windows, macOS, Linux",
    knownFor: ["ממשק מודרני ופשוט", "תמיכות אוטומטיות וידניות, חלול וחורי ניקוז", "תמיכה במדפסות רבות"],
    suits: "מתחילים עד חובבים",
  },
  {
    id: "preform",
    group: "resin",
    name: "PreForm",
    maker: "Formlabs",
    license: "free",
    platforms: "Windows, macOS",
    output: [".form"],
    knownFor: ["רק למדפסות Formlabs (SLA ו־SLS)", "תמיכות אוטומטיות, וסידור חלקים אוטומטי (nesting) ב־SLS", "מייבא גם קבצי STEP"],
    suits: "מתחילים עד מקצוענים",
  },
  {
    id: "prusaslicer-sla",
    group: "resin",
    name: "PrusaSlicer (SLA mode)",
    maker: "Prusa Research",
    license: "open-source",
    licenseNote: "AGPL-3.0",
    platforms: "Windows, macOS, Linux",
    output: [".sl1", ".sl1s"],
    knownFor: ["אותו תוכנה כמו ה־FDM, במצב למדפסות mSLA", "תמיכות אוטומטיות וידניות, חלול וחורי ניקוז"],
    suits: "חובבים עד מקצוענים",
  },
];

/** Context only: software used to prepare powder-bed and metal jobs at service bureaus. */
export const industrialNote =
  "בתעשייה משתמשים בתוכנות הכנה ייעודיות, כמו Materialise Magics ו־Netfabb: הן מתקנות קבצים, מייצרות תמיכות ומסדרות הרבה חלקים יחד (nesting). בדרך כלל מפעילים אותן אצל נותני שירות.";
