// Materials. Edit ratings and Hebrew text freely; no layout code depends on them.
//
// Fields (see CLAUDE.md "Data schemas"):
//   id           unique; referenced by technologies.js (materialIds) and useCases.js
//   family       filament | resin | powder
//   techIds      technologies that can print it. The FIRST one sets the colour of its radar/dots.
//   ratings      each 1-5, 5 = better for that axis (strength, flexibility, heat, uv, easeOfPrint).
//                Typical values for common grades, meant for comparison between materials.
//   failureRisk  ids from issues.js this material is especially prone to (M3 adds more issues
//                and fills this in properly).
//   safety       level: low | med | high, notes: what to do about it
//   summary      2-3 sentences: what it is good for and its main catch
//
// Ratings are "relative to other printable plastics", not lab values.

export const materials = [
  // ---------------- Filament (FDM) ----------------
  {
    id: "pla",
    name: "PLA",
    techIds: ["fdm"],
    family: "filament",
    ratings: { strength: 3, flexibility: 1, heat: 1, uv: 2, easeOfPrint: 5 },
    failureRisk: ["stringing"],
    safety: { level: "low", notes: "כמעט בלי ריח או אדים משמעותיים. מספיק חדר מאוורר." },
    summary: "חומר ההתחלה: קל להדפסה ומדויק, אבל נוקשה ומתרכך כבר סביב 55–60°C. מתאים לדגמים ולחלקים שלא מתחממים ולא נשחקים.",
  },
  {
    id: "petg",
    name: "PETG",
    techIds: ["fdm"],
    family: "filament",
    ratings: { strength: 4, flexibility: 3, heat: 2, uv: 3, easeOfPrint: 4 },
    failureRisk: ["stringing", "bed-adhesion"],
    safety: { level: "low", notes: "אדים מועטים. מספיק אוורור רגיל." },
    summary: "איזון טוב בין חוזק לקלות הדפסה, עמיד ללחות ולכימיקלים. הנטייה שלו להשאיר חוטי פלסטיק דורשת כיוון הגדרות.",
  },
  {
    id: "abs",
    name: "ABS",
    techIds: ["fdm"],
    family: "filament",
    ratings: { strength: 4, flexibility: 2, heat: 3, uv: 2, easeOfPrint: 2 },
    failureRisk: ["warping", "delamination", "bed-adhesion"],
    safety: { level: "med", notes: "פולט אדי סטירן בזמן ההדפסה. הדפיסו במארז סגור ובחדר מאוורר, רצוי עם סינון." },
    summary: "חזק, עמיד בחום ואפשר להחליק אותו באדי אצטון. מתכווץ בהתקררות, ולכן נוטה להתעקם ודורש מארז סגור.",
  },
  {
    id: "asa",
    name: "ASA",
    techIds: ["fdm"],
    family: "filament",
    ratings: { strength: 4, flexibility: 2, heat: 3, uv: 5, easeOfPrint: 2 },
    failureRisk: ["warping", "delamination", "bed-adhesion"],
    safety: { level: "med", notes: "אדים דומים ל־ABS. מארז סגור ואוורור." },
    summary: "כמו ABS, אבל עמיד לשמש ולמזג אוויר ולכן הבחירה לחלקים בחוץ. אותה נטייה להתעקם.",
  },
  {
    id: "tpu",
    name: "TPU",
    techIds: ["fdm"],
    family: "filament",
    ratings: { strength: 3, flexibility: 5, heat: 2, uv: 3, easeOfPrint: 2 },
    failureRisk: ["stringing", "under-extrusion"],
    safety: { level: "low", notes: "אדים מועטים. מספיק אוורור רגיל." },
    summary: "גמיש כמו גומי, עמיד לשחיקה ולכוחות פתאומיים: אטמים, כיסויים, בולמי זעזועים. רך מכדי להידחף בקלות, אז מדפיסים לאט, רצוי עם מגש ישיר.",
  },
  {
    id: "nylon",
    name: "Nylon (PA)",
    techIds: ["fdm"],
    family: "filament",
    ratings: { strength: 5, flexibility: 3, heat: 4, uv: 2, easeOfPrint: 2 },
    failureRisk: ["warping", "delamination", "under-extrusion"],
    safety: { level: "med", notes: "אדים קלים בטמפרטורה גבוהה. אוורור, ואחסון יבש כי הוא סופג לחות." },
    summary: "חזק, עמיד לשחיקה ולעייפות: גלגלי שיניים, צירים, חלקים נעים. סופג לחות מהאוויר, ולכן חייבים לייבש אותו לפני הדפסה.",
  },
  {
    id: "pc",
    name: "PC",
    techIds: ["fdm"],
    family: "filament",
    ratings: { strength: 5, flexibility: 2, heat: 5, uv: 2, easeOfPrint: 1 },
    failureRisk: ["warping", "delamination", "bed-adhesion"],
    safety: { level: "med", notes: "הדפסה בחום גבוה מאוד. מארז סגור ואוורור טוב." },
    summary: "מהחזקים והחמים שאפשר להדפיס בבית (עמיד לכ־110°C). דורש פיה חמה מאוד, מארז סגור ויבש, ונוטה מאוד להתעקם.",
  },
  {
    id: "composite",
    name: "CF/GF composite",
    techIds: ["fdm"],
    family: "filament",
    ratings: { strength: 5, flexibility: 1, heat: 4, uv: 3, easeOfPrint: 2 },
    failureRisk: ["under-extrusion", "warping"],
    safety: { level: "med", notes: "אבק סיבים בשיוף: מסכה ואוורור. הסיבים שוחקים פיית פליז, ולכן צריך פיית פלדה קשוחה." },
    summary: "חומרים מחוזקי סיבים: פלסטיק (בדרך כלל ניילון או PETG) עם סיבי פחמן (CF) או סיבי זכוכית (GF): קשיח מאוד ויציב בצורתו. שביר יותר, ושוחק את הפיה.",
  },

  // ---------------- Resin (SLA / MSLA) ----------------
  {
    id: "resin-standard",
    name: "Standard resin",
    techIds: ["sla", "msla"],
    family: "resin",
    ratings: { strength: 2, flexibility: 1, heat: 1, uv: 1, easeOfPrint: 4 },
    failureRisk: ["resin-detach", "resin-overexposure", "resin-sticky"],
    safety: { level: "high", notes: "נוזל מגרה ואלרגני. כפפות ניטריל, אוורור, בלי מגע בעור לפני הקשיה, וסילוק פסולת כשרף מוקשה." },
    summary: "פירוט מעולה ומשטח חלק, אבל שביר. מתאים לדגמים, דמויות ואבות־טיפוס חזותיים, לא לחלקים מאומצים.",
  },
  {
    id: "resin-tough",
    name: "Tough resin (ABS-like)",
    techIds: ["sla", "msla"],
    family: "resin",
    ratings: { strength: 4, flexibility: 2, heat: 2, uv: 1, easeOfPrint: 3 },
    failureRisk: ["resin-detach", "resin-overexposure"],
    safety: { level: "high", notes: "כמו כל שרף: כפפות, אוורור, שטיפה והקשיה. שומרים בבקבוק כהה." },
    summary: "שרף עמיד לפגיעות, שמתנהג יותר כמו פלסטיק הנדסי ופחות כמו זכוכית. לחלקים שמבריגים, נלחצים או עלולים ליפול.",
  },
  {
    id: "resin-flex",
    name: "Flexible resin",
    techIds: ["sla", "msla"],
    family: "resin",
    ratings: { strength: 2, flexibility: 5, heat: 1, uv: 1, easeOfPrint: 2 },
    failureRisk: ["resin-fep", "resin-sticky"],
    safety: { level: "high", notes: "כפפות, אוורור ושטיפה. חומר רך שנדבק לסרט התחתית ומצריך הגדרות זהירות." },
    summary: "דמוי גומי או סיליקון, לאטמים, ידיות ודגמי מגע רכים. רך מכדי לשאת עומס, וקשה יותר להדפיס בהצלחה.",
  },
  {
    id: "resin-hightemp",
    name: "High-temp resin",
    techIds: ["sla", "msla"],
    family: "resin",
    ratings: { strength: 3, flexibility: 1, heat: 5, uv: 2, easeOfPrint: 2 },
    failureRisk: ["resin-detach"],
    safety: { level: "high", notes: "כפפות, אוורור ושטיפה. דורש הקשיה ממושכת, לעיתים בחימום." },
    summary: "אחרי הקשיה מחזיק טמפרטורות של כמה מאות מעלות: תבניות, חלקים ליד חום, הזרקת פלסטיק. דורש עבודה זהירה, והחלק שביר.",
  },
  {
    id: "resin-castable",
    name: "Castable resin",
    techIds: ["sla", "msla"],
    family: "resin",
    ratings: { strength: 1, flexibility: 1, heat: 1, uv: 1, easeOfPrint: 3 },
    failureRisk: ["resin-overexposure"],
    safety: { level: "high", notes: "כפפות ואוורור. בשריפה בתנור משתחררים אדים: מבצעים רק בתנור יציקה ייעודי." },
    summary: "נשרף כמעט בלי שאריות, ולכן מדפיסים דגם, יוצקים סביבו גבס ויוצקים בו מתכת. הבחירה לתכשיטים. הדגם עצמו שביר.",
  },
  {
    id: "resin-dental",
    name: "Dental resin",
    techIds: ["sla", "msla"],
    family: "resin",
    ratings: { strength: 3, flexibility: 2, heat: 2, uv: 1, easeOfPrint: 2 },
    failureRisk: ["resin-sticky", "resin-overexposure"],
    safety: { level: "high", notes: "דורש תהליך שטיפה והקשיה מאושר לאותו שרף. אסור להחליף חומרים או הגדרות בלי אימות." },
    summary: "שרפים ביו־תואמים ומאושרים לשימוש רפואי: מדריכי ניתוח, סד שיניים, דגמים. ההדפסה עצמה קלה, אבל כל השרשרת חייבת להיות מבוקרת ומתועדת.",
  },

  // ---------------- Powder (SLS / MJF) ----------------
  {
    id: "pa12",
    name: "PA12 (Nylon 12)",
    techIds: ["sls", "mjf"],
    family: "powder",
    ratings: { strength: 4, flexibility: 2, heat: 4, uv: 3, easeOfPrint: 3 },
    failureRisk: ["powder-warp", "powder-rough", "powder-shrink"],
    safety: { level: "med", notes: "אבקה דקה: מסכה וניקוי בציוד סגור, בלי לפזר אבק בחדר. בדרך כלל מתבצע אצל נותן שירות." },
    summary: "התקן של הדפסת אבקה: חזק, עמיד ויציב בצורתו. מתאים לחלקים פונקציונליים, צירים ומארזים. המשטח גרגרי ומט.",
  },
  {
    id: "pa11",
    name: "PA11 (Nylon 11)",
    techIds: ["sls", "mjf"],
    family: "powder",
    ratings: { strength: 4, flexibility: 3, heat: 4, uv: 4, easeOfPrint: 3 },
    failureRisk: ["powder-warp", "powder-rough", "powder-shrink"],
    safety: { level: "med", notes: "כמו PA12: אבקה דקה, מסכה וניקוי בציוד סגור." },
    summary: "ניילון על בסיס שמן קיק: גמיש ועמיד לפגיעות יותר מ־PA12, ועמיד טוב יותר לשמש. בחירה טובה לחלקים שצריכים לספוג זעזועים.",
  },
  {
    id: "tpu-powder",
    name: "TPU powder",
    techIds: ["sls", "mjf"],
    family: "powder",
    ratings: { strength: 3, flexibility: 5, heat: 2, uv: 3, easeOfPrint: 2 },
    failureRisk: ["powder-warp", "powder-shrink"],
    safety: { level: "med", notes: "אבקה דקה: מסכה וניקוי בציוד סגור." },
    summary: "גמיש כמו גומי, ואפשר להדפיס ממנו מבנים סבכיים בלי תמיכות: סוליות, אטמים, ריפוד. בדרך כלל זמין רק אצל נותני שירות.",
  },
];
