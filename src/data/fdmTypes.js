// FDM printer types (the machine's MOTION SYSTEM). Edit the Hebrew text and ratings freely.
// All of these print with the same FDM process (see technologies.js -> fdm); what differs is
// WHAT MOVES to put the nozzle in the right place, and that decides speed, accuracy, shape of the
// print volume and how much upkeep the machine needs.
//
// Fields:
//   diagram     id of the animation in src/diagrams/index.js
//   view        caption of the main drawing (top / front / side)
//   sideDiagram optional second drawing (the Z axis, bed or gantry moving up/down) + sideView caption;
//               when present the panel shows a "top view / Z axis" switch
//   moves       what each part of the machine does: [{part, does}]
//   volume      shape of the print volume
//   short       one-line summary for the comparison table
//   ratings     1-5, 5 = better (speed, accuracy, upkeep = how EASY the upkeep is)
//   examples    well-known machines of this type
//   note        optional extra explanation shown under the process text
//
// Sources: the QIDI "FDM 3D printer types guide" for the list of types and their strengths and
// weaknesses; the ratings are typical values for comparison between types, not measurements.

export const fdmTypes = [
  {
    id: "cartesian",
    name: "Cartesian",
    nameLong: "Cartesian (bed-slinger)",
    diagram: "bedslinger",
    view: "מבט מלמעלה: המיטה נעה ב־Y והראש ב־X",
    sideDiagram: "bedslingerz",
    sideView: "מבט מהצד: המיטה נעה קדימה ואחורה, והגשר עם הראש עולה שכבה אחרי שכבה",
    principle: "הראש נע שמאלה וימינה (ציר X) והמיטה נעה קדימה ואחורה (ציר Y). הגובה (ציר Z) משתנה רק בין שכבות.",
    moves: [
      { part: "ראש ההדפסה", does: "שמאלה וימינה (X)" },
      { part: "המיטה והחלק עליה", does: "קדימה ואחורה (Y)" },
      { part: "גובה (Z)", does: "הגשר עולה, או המיטה יורדת, בין שכבות" },
    ],
    note: "המיטה נעה עם החלק שעליה. ככל שהחלק כבד וגבוה יותר צריך להאט כדי שלא יתנדנד.",
    pros: ["המבנה הפשוט ביותר: קל להבין, להרכיב ולתקן", "מעט חלקים נעים, ולכן תחזוקה קלה", "מגוון עצום של מדפסות וחלקי חילוף"],
    cons: ["המיטה והחלק מאיצים ומאטים, ולכן מוגבלים במהירות", "חלק גבוה וצר עלול לרעוד על המיטה הנעה", "דיוק טוב אבל לא הגבוה ביותר"],
    bestFor: "התחלה ולימוד, אבות־טיפוס וחלקים יומיומיים.",
    volume: "תיבה",
    short: "הראש ב־X, המיטה ב־Y",
    ratings: { speed: 2, accuracy: 3, upkeep: 5 },
    examples: "Creality Ender 3, Prusa MK4",
  },
  {
    id: "corexy",
    name: "CoreXY",
    nameLong: "CoreXY",
    diagram: "corexy",
    view: "מבט מלמעלה (הרצועות מושמטות)",
    sideDiagram: "corexyz",
    sideView: "מבט חזית: הראש נע ימינה ושמאלה, והמיטה יורדת שכבה אחרי שכבה",
    principle: "שני מנועים קבועים על המסגרת, באמצעות רצועות, מזיזים את הראש בשני הצירים יחד. המיטה לא נעה במישור.",
    moves: [
      { part: "ראש ההדפסה", does: "גם X וגם Y, דרך הרצועות" },
      { part: "המנועים", does: "קבועים על המסגרת ופועלים יחד" },
      { part: "המיטה", does: "לא נעה במישור (רק גובה בין שכבות)" },
    ],
    note: "מנועים שמסתובבים באותו כיוון מזיזים את הראש בציר אחד, וכיוונים הפוכים בציר השני. מנוע אחד לבד מזיז אלכסונית. H-Bot הוא אותו רעיון עם רצועה אחת: פשוט יותר, אבל הרצועה מעוותת את הגשר בתנועות אלכסוניות ולכן כמעט נעלם.",
    pros: ["מהיר ומדויק: רק הראש הקל מאיץ, והחלק לא נע", "נפח הדפסה מלבני וניצול טוב של המסגרת", "מתאים למארז סגור, וטוב לחומרים כמו ABS ו־ASA"],
    cons: ["מערכת רצועות מורכבת יותר: מתיחות ויישור דורשים תשומת לב", "פחות סליחה לטעויות בהרכבה ובכיול", "תחזוקה מורכבת יותר ממכונה קרטזית"],
    bestFor: "הדפסה מהירה ואיכותית, וחלקים הנדסיים בשימוש אינטנסיבי.",
    volume: "תיבה",
    short: "הראש ב־X וב־Y, המיטה לא",
    ratings: { speed: 4, accuracy: 5, upkeep: 2 },
    examples: "Bambu Lab X1 ו־P1, Voron 2.4, QIDI Q2",
  },
  {
    id: "delta",
    name: "Delta",
    nameLong: "Delta",
    diagram: "delta",
    view: "מבט חזית (המגדל השלישי מאחור)",
    principle: "שלוש זרועות תלויות משלושה מגדלים אנכיים. כל מגדל מרים או מוריד את הזרוע שלו, ומקום המפגש של הזרועות קובע איפה הפיה. המיטה קבועה.",
    moves: [
      { part: "ראש ההדפסה", does: "בכל הצירים, דרך שלוש הזרועות" },
      { part: "העגלות", does: "אחת בכל מגדל, עולות ויורדות" },
      { part: "המיטה", does: "קבועה ועגולה" },
    ],
    note: "כל תנועה דורשת חישוב משולב של שלוש העגלות, ולכן המכונה רגישה לשגיאות כיול קטנות.",
    pros: ["מהירה מאוד: ראש קל ותנועות אנכיות מהירות", "נפח גבוה ועגול, מתאים לחלקים גבוהים", "המיטה והחלק לא זזים"],
    cons: ["כיול מורכב, ושגיאה קטנה מעוותת את כל החלק", "הדיוק לא אחיד לאורך המיטה", "השטח השמיש קטן מהמוצהר"],
    bestFor: "חלקים גבוהים וצרים, והדפסה מהירה כשהדיוק פחות קריטי.",
    volume: "גליל",
    short: "הראש דרך שלוש זרועות",
    ratings: { speed: 5, accuracy: 3, upkeep: 2 },
    examples: "FLSUN V400, Anycubic Kossel",
  },
  {
    id: "polar",
    name: "Polar",
    nameLong: "Polar",
    diagram: "polar",
    view: "מבט מלמעלה",
    principle: "המיטה העגולה מסתובבת, והראש נע רק פנימה והחוצה לאורך רדיוס אחד. סיבוב והתקרבות ביחד מגיעים לכל נקודה.",
    moves: [
      { part: "המיטה", does: "מסתובבת סביב המרכז" },
      { part: "ראש ההדפסה", does: "פנימה והחוצה לאורך הרדיוס" },
      { part: "גובה (Z)", does: "הראש עולה בין שכבות" },
    ],
    note: "מהירות הקו בקצה המיטה גבוהה בהרבה מאשר ליד המרכז, ולכן צריך לווסת את כמות הפלסטיק.",
    pros: ["מבנה מכני פשוט עם מעט חלקים נעים", "ניצול טוב של מיטה עגולה"],
    cons: ["תוכנה מורכבת: צריך להמיר קואורדינטות", "מעט מדפסות ומעט קהילה", "מהירות הקו משתנה בין המרכז לקצה"],
    bestFor: "נישה: פרויקטים ניסיוניים ולימוד. כמעט לא קיימת בשוק הצרכני.",
    volume: "גליל",
    short: "המיטה מסתובבת, הראש רדיאלי",
    ratings: { speed: 3, accuracy: 3, upkeep: 3 },
    examples: "כמעט אין מדפסות צרכניות",
  },
  {
    id: "scara",
    name: "SCARA",
    nameLong: "SCARA",
    diagram: "scara",
    view: "מבט מלמעלה",
    principle: "זרוע רובוטית עם שני מפרקים מסתובבים מזיזה את הראש בקשתות מעל מיטה קבועה.",
    moves: [
      { part: "ראש ההדפסה", does: "בקשתות, בקצה הזרוע" },
      { part: "מפרק הבסיס והמרפק", does: "שניהם מסתובבים" },
      { part: "המיטה", does: "קבועה" },
    ],
    note: "כל נקודה על המיטה דורשת שילוב של שתי זוויות, ולכן הכיול והתוכנה מורכבים יותר.",
    pros: ["מהירה ויעילה בשטח: מגיעה לכל נקודה בלי להזיז את המיטה", "גמישה: אפשר להוסיף צירים", "מדויקת כשהיא מכוילת היטב"],
    cons: ["מורכבת להפעלה, לכיול ולתכנות", "בעיקר תעשייתית", "מעט מדפסות צרכניות"],
    bestFor: "ייצור תעשייתי וחלקים מורכבים בסדרות.",
    volume: "משתנה, לפי אורך הזרוע",
    short: "הראש בקשתות",
    ratings: { speed: 5, accuracy: 4, upkeep: 2 },
    examples: "מדפסות תעשייתיות ומערכות ניסיוניות",
  },
  {
    id: "belt",
    name: "Belt",
    nameLong: "Belt (conveyor)",
    diagram: "belt",
    view: "מבט צד",
    principle: "המיטה היא מסוע: חגורה שנעה כל הזמן. הראש מוטה ב־45° ובונה שכבות משופעות, ואחרי כל שכבה החגורה מתקדמת.",
    moves: [
      { part: "החגורה והחלק", does: "מתקדמת קדימה בציר הארוך" },
      { part: "ראש ההדפסה", does: "מוטה, עולה ויורד לאורך השיפוע" },
      { part: "חלק גמור", does: "יוצא מהמכונה והחגורה ממשיכה" },
    ],
    note: "השכבות משופעות, ולכן החוזק של החלק בכיוונים שונים שונה ממכונה רגילה, והסלייסר צריך לתמוך בציר משופע.",
    pros: ["אורך בלתי מוגבל", "ייצור רציף: מוציאים חלק והמכונה ממשיכה", "מתאימה לסדרות של חלקים קטנים"],
    cons: ["רוחב וגובה מוגבלים", "חלקים גבוהים ודקים לא יציבים", "נדרש סלייסר שתומך בציר משופע"],
    bestFor: "חלקים ארוכים (קורות, צינורות) וייצור רציף.",
    volume: "ארוך וצר",
    short: "חגורה נעה, ראש מוטה",
    ratings: { speed: 3, accuracy: 3, upkeep: 3 },
    examples: "Creality CR-30, Blackbelt",
  },
];
