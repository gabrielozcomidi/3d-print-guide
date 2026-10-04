// Infill patterns. Edit freely. Pattern DRAWINGS come from src/diagrams/infillDemo.js (keys = ids here).
//
// Fields: id, name (English), how, callsIt ([slicer, name] pairs: what slicers call it), ratings (1-5, 5 = better for
// that axis: strength, speed, material = saves material, top = supports the top surface),
// pros[], cons[], bestFor, fixedDensity (a note, set when the percentage barely applies).
// Ratings are relative comparisons between patterns at the same density, not measurements.

export const patterns = [
  {
    id: "lines",
    name: "Lines (Rectilinear)",
    how: "קווים מקבילים בכיוון אחד, שמתחלף בין שכבות. הפשוט ביותר: בלי חיתוכים בין קווים.",
    callsIt: [["Cura", "Lines"], ["PrusaSlicer", "Rectilinear"]],
    ratings: { strength: 2, speed: 5, material: 4, top: 3 },
    pros: ["פשוט וקצר להדפסה", "הפיה לא חוצה קווים באותה שכבה"],
    cons: ["חזק בעיקר בכיוון הקווים של כל שכבה"],
    bestFor: "הדפסות מהירות וחלקים לא מאומצים.",
  },
  {
    id: "grid",
    name: "Grid",
    how: "קווים בשני כיוונים שחוצים זה את זה בכל שכבה, ולכן בנקודות החיתוך מצטבר חומר.",
    callsIt: [["Cura", "Grid"], ["PrusaSlicer", "Grid"]],
    ratings: { strength: 3, speed: 3, material: 3, top: 4 },
    pros: ["מילוי יציב ונפוץ", "תמיכה טובה למשטח העליון"],
    cons: ["הפיה חוצה קווים: בנקודות החיתוך החומר מצטבר, והפיה עלולה להיתקל בו"],
    bestFor: "שימוש כללי.",
  },
  {
    id: "triangles",
    name: "Triangles",
    how: "קווים בשלושה כיוונים באותה שכבה, שיוצרים משולשים.",
    callsIt: [["Cura", "Triangles"], ["PrusaSlicer", "Triangles"]],
    ratings: { strength: 3, speed: 2, material: 2, top: 4 },
    pros: ["מילוי צפוף ויציב במישור השכבה"],
    cons: ["חיתוכים רבים בין קווים", "משתמש ביותר חומר וזמן"],
    bestFor: "חלקים שרוצים בהם מילוי יציב במישור.",
  },
  {
    id: "cubic",
    name: "Cubic",
    how: "דפוס תלת־ממדי של קוביות עם פינה אחת כלפי מטה. הצורה משתנה בין שכבות, וחלוקת החוזק שווה יותר בין הכיוונים.",
    callsIt: [["Cura", "Cubic"], ["PrusaSlicer", "Cubic"]],
    ratings: { strength: 4, speed: 3, material: 3, top: 3 },
    pros: ["חלוקת חוזק שווה יותר בין הכיוונים", "איזון טוב בין חוזק למהירות"],
    cons: ["יוצר גם כיסי אוויר"],
    bestFor: "חלקים מכניים בשימוש כללי.",
  },
  {
    id: "gyroid",
    name: "Gyroid",
    how: "קווים גליים רציפים שמשתנים בין שכבות. לפי Prusa, אחד המבנים התלת־ממדיים המעטים שנותנים תמיכה טובה בכל הכיוונים.",
    callsIt: [["Cura", "Gyroid"], ["PrusaSlicer", "Gyroid"]],
    ratings: { strength: 4, speed: 3, material: 3, top: 3 },
    pros: ["תמיכה טובה בכל הכיוונים", "בלי חיתוכים חדים בין קווים"],
    cons: ["דפוס מורכב: הפיה משנה כיוון כל הזמן"],
    bestFor: "חלקים שנושאים עומס מכיוונים שונים.",
  },
  {
    id: "honeycomb",
    name: "Honeycomb",
    how: "רשת של משושים בלי חיתוכים בין קווים. איטית וכבדה: לפי Prusa, בערך פי 2 בזמן וכ־25% יותר חומר.",
    callsIt: [["Cura", "Honeycomb"], ["PrusaSlicer", "Honeycomb"]],
    ratings: { strength: 3, speed: 1, material: 2, top: 4 },
    pros: ["בלי חיתוכים בין קווים"],
    cons: ["איטי מאוד", "יותר חומר וזמן"],
    bestFor: "חלקים שההדפסה האיטית לא מפריעה בהם.",
  },
  {
    id: "concentric",
    name: "Concentric",
    how: "לולאות שעוקבות אחרי קו המתאר, פנימה. איטי יותר, ושימושי לדגמים גמישים.",
    callsIt: [["Cura", "Concentric"], ["PrusaSlicer", "Concentric"]],
    ratings: { strength: 2, speed: 2, material: 3, top: 2 },
    pros: ["שימושי לדגמים גמישים, למשל מ־TPU", "בלי חיתוכים"],
    cons: ["איטי יותר"],
    bestFor: "חלקים גמישים.",
  },
  {
    id: "lightning",
    name: "Lightning",
    how: "מבנה מסתעף שנעשה צפוף יותר ככל שמתקרבים למשטחים העליונים. מטרתו חיסכון מרבי בחומר, ותמיכה רק בתקרה של הדגם.",
    callsIt: [["Cura", "Lightning"], ["PrusaSlicer", "Lightning"]],
    ratings: { strength: 1, speed: 5, material: 5, top: 3 },
    pros: ["הכי חסכוני בחומר", "תומך רק במה שצריך, מתחת למשטח העליון"],
    cons: ["כמעט לא מוסיף חוזק"],
    bestFor: "פסלונים ודגמי תצוגה.",
    fixedDensity: "המילוי הזה כמעט לא תלוי באחוז: הוא מוסיף רק מה שצריך מתחת למשטח העליון.",
  },
];

/** How much infill for what, on a 0-100% scale (Prusa Knowledge Base guidance). */
export const infillGuide = [
  { use: "רוב הדגמים", from: 10, to: 15, note: "לפי Prusa, רוב הדגמים מודפסים היטב עם 10–15%. ברירת המחדל ב־Cura וב־PrusaSlicer היא 20%." },
  { use: "עמידות או עומס", from: 20, to: 30, note: "עד כ־30% כשצריך עמידות או התנגדות לדחיסה." },
  { use: "מילוי מלא", from: 100, to: 100, note: "נדרש רק לעיתים נדירות, ומכריח דפוס של קווים ישרים (Rectilinear)." },
];

export const infillNotes = ["0% מתאים רק כשהדגם נסגר בהדרגה בחלקו העליון, ובדרך כלל לא מומלץ."];

export const wallsNote =
  "לפי Prusa, החוזק של דגם נקבע בעיקר על ידי מספר הקירות (perimeters) ולא על ידי המילוי. המילוי בעיקר תומך בשכבות העליונות. לכן לחלק חזק כדאי להוסיף קירות לפני שמעלים את אחוז המילוי.";

export const resinNote =
  "בשרף אין תבנית מילוי: החלק מלא כברירת מחדל. אפשר לחלל אותו (hollowing) כדי לחסוך שרף, להקטין את כוח הניתוק ולצמצם תמיכות. צריך קיר בעובי מינימלי של כמילימטר (ב־PrusaSlicer ברירת המחדל 3 מ״מ), ולפחות שני חורי ניקוז, אחד קרוב לפלטה, כדי שהשרף שלא התקשה לא יישאר לכוד.";
