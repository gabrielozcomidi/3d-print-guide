// "From model to print": the stages every print goes through. Edit freely.
//
// Each stage has the FDM text (`text`) and optional variants for resin and powder printing
// (`resin`, `powder`). The family switch on the page picks the variant (falls back to `text`).
//
// Other fields:
//   short        label on the stage tab
//   art          id of the drawing in src/diagrams/workflow.js
//   toolGroups   [{label, items[]}]: software people use at this stage (English names, no official Hebrew names)
//   formats      [{name, meaning}]: file formats and what they contain
//   code         G-code sample for the G-code stage: [{line, meaning}] (+ codeNote, and formatsResin for resin printers)
//   issueLink    an issue id from issues.js: "see also" link into Troubleshooting
//
// Facts about tools and formats were checked against official documentation (see the research notes
// in CLAUDE.md). Keep tool lists short: they are examples, not a catalogue.

export const families = [
  { id: "fdm", label: "פילמנט" },
  { id: "resin", label: "שרף" },
  { id: "powder", label: "אבקה" },
];

export const stages = [
  {
    id: "model",
    short: "דגם",
    title: "מכינים דגם",
    art: "model",
    text: "הדגם מגיע משלושה מקורות: מעצבים אותו בתוכנת CAD או במודלר, סורקים חפץ אמיתי, או מורידים דגם מוכן ממאגר.",
    resin: "בדגמי פרטים, כמו מיניאטורות ופסלונים, בדרך כלל מפסלים דיגיטלית או מורידים דגם מוכן.",
    powder: "בהזמנה מנותן שירות מעלים קובץ ומקבלים הצעה. הקובץ הוא בדרך כלל STEP או STL.",
    toolGroups: [
      { label: "תכנון הנדסי (CAD)", items: ["Fusion", "FreeCAD", "Onshape", "SolidWorks", "Tinkercad"] },
      { label: "פיסול וצורות אורגניות", items: ["Blender"] },
      { label: "מאגרי דגמים", items: ["Printables", "Thingiverse", "MakerWorld", "Thangs"] },
    ],
  },
  {
    id: "check",
    short: "בדיקה",
    title: "מייצאים ובודקים",
    art: "check",
    text: "מייצאים לקובץ רשת (STL או 3MF) ובודקים שהדגם אטום: בלי חורים, בלי קירות דקים מדי ובכיוון הנכון על הפלטה.",
    resin: "אותה בדיקה, ובנוסף חשוב לוודא שיש חלל לניקוז שרף בחלקים חלולים.",
    powder: "נותן השירות בודק את הקובץ בעצמו, אבל גם כאן קירות דקים מדי וחורים עלולים לגרום לדחייה.",
    formats: [
      { name: "STEP", meaning: "גוף מדויק מתמטית כמו שמעצבים ב־CAD. לא רשת, ולכן צריך להמיר אותו לפני חיתוך." },
      { name: "STL", meaning: "רשת משולשים בלבד: בלי צבע, בלי הגדרות הדפסה ובלי יחידות מוגדרות." },
      { name: "3MF", meaning: "רשת עם יחידות, צבעים, כמה חלקים והגדרות הדפסה. תקן בינלאומי מודרני." },
      { name: "OBJ", meaning: "רשת עם צבע וטקסטורה, נפוצה בסריקות ובגרפיקה." },
    ],
    toolGroups: [{ label: "תיקון רשת", items: ["Netfabb", "תיקון מובנה בסלייסר"] }],
  },
  {
    id: "slice",
    short: "חיתוך",
    title: "חותכים לשכבות",
    art: "slice",
    text: "הסלייסר (Slicer) חותך את הדגם לשכבות ומחליט איך להדפיס כל אחת: עובי שכבה, כמות קירות, מילוי (infill), תמיכות, טמפרטורות ומהירות.",
    resin: "בשרף הסלייסר יוצר תמונה לכל שכבה ומוסיף תמיכות. ההגדרות העיקריות הן עובי שכבה וזמן חשיפה.",
    powder: "אין סלייסר ביתי: תוכנת nesting מסדרת הרבה חלקים בנפח האבקה, ונותן השירות קובע את ההגדרות.",
    toolGroups: [{ label: "סלייסרים נפוצים", items: ["Cura", "PrusaSlicer", "OrcaSlicer", "Bambu Studio"] }],
  },
  {
    id: "gcode",
    short: "G-code",
    title: "מקבלים קובץ הוראות",
    art: "gcode",
    text: "הפלט הוא קובץ טקסט של פקודות: לאן לנוע, כמה פלסטיק לשחול ובאיזה חום. קוראים לו G-code.",
    resin: "במדפסת שרף אין G-code: הקובץ מכיל תמונה של כל שכבה והגדרות, בפורמט שתלוי בדגם המדפסת.",
    powder: "הקובץ נשאר אצל נותן השירות, והוא כבר מוכן למכונה.",
    code: [
      { line: "G28", meaning: "לחזור לנקודת האפס בכל הצירים (homing)" },
      { line: "M140 S60", meaning: "לחמם את המיטה ל־60°C" },
      { line: "M104 S210", meaning: "לחמם את הפיה ל־210°C" },
      { line: "G1 X50 Y50 Z0.2 F3000", meaning: "לנוע לנקודה, עם גובה שכבה ראשונה 0.2 מ״מ" },
      { line: "G1 X80 Y50 E4.2", meaning: "לנוע ולשחול פלסטיק בו־זמנית (E הוא הפלסטיק)" },
    ],
    codeNote: "הפקודות משתנות מעט בין קושחות (Marlin, Klipper, RepRap), לכן סלייסר צריך לדעת לאיזו מדפסת הוא מייצר.",
    formatsResin: [
      { name: ".ctb / .cbddlp", meaning: "Chitubox. מדפסות חדשות דורשות לעיתים את הגרסה החדשה של ctb." },
      { name: ".photon / .pwmx", meaning: "Anycubic (Photon Workshop)." },
      { name: ".goo", meaning: "Elegoo." },
      { name: ".sl1 / .sl1s", meaning: "PrusaSlicer." },
      { name: ".form", meaning: "Formlabs (PreForm)." },
    ],
  },
  {
    id: "send",
    short: "שליחה",
    title: "שולחים למדפסת",
    art: "send",
    text: "מעבירים את הקובץ למדפסת: כרטיס SD או USB, או דרך הרשת (Wi-Fi) ושרת כמו OctoPrint או Klipper.",
    resin: "בדרך כלל דרך USB או דרך הרשת, לפי הדגם.",
    powder: "נותן השירות מעלה את העבודה לתור הייצור.",
  },
  {
    id: "first",
    short: "שכבה ראשונה",
    title: "מסתכלים על השכבה הראשונה",
    art: "first",
    text: "השכבה הראשונה קובעת אם ההדפסה כולה תצליח. אם היא לא נדבקת למיטה, כל מה שמעליה ייכשל.",
    resin: "בודקים שהחלק נאחז בפלטה. כשל כאן אומר שהחלק יישאר באמבט.",
    powder: "אין מה לראות בזמן ההדפסה: האבקה סגורה בתא.",
    issueLink: "bed-adhesion",
  },
  {
    id: "post",
    short: "גימור",
    title: "מסיימים",
    art: "post",
    text: "מסירים תמיכות, משייפים ומחליקים לפי הצורך, ואם רוצים גם צובעים.",
    resin: "שוטפים באלכוהול (IPA) ומקשים באור UV, ורק אחר כך מסירים תמיכות.",
    powder: "מנקים אבקה, בדרך כלל בהתזת חרוזים, ואם רוצים צובעים בטבילה.",
  },
];
