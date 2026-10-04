// Supports. Edit freely. Facts were checked against slicer documentation in October 2026 (M8 research).
//
// Groups = kinds of printing. Each group has support STYLES:
//   id, name (English), kind (which demo drawing: normal|tree|soluble|metal|powder|resin-light|resin-medium|resin-heavy),
//   modes (which demo modes apply: bare = no supports, with = supports growing, removed = after removal),
//   modeLabels (optional: replaces the default mode names), how, callsIt (what slicers call it),
//   ratings (1-5, 5 = better: material, surface, removal, setup / hold), pros[], cons[], whenToUse, needs.

/** Shared advice for resin supports (orientation and drainage), from Formlabs documentation. */
const RESIN_TIP = "הטיית החלק בכ־45° מקטינה עיוות ואת כוח הניתוק. חלל שפונה כלפי האמבט עלול ליצור כוס יניקה, ולכן ממלאים אותו או מוסיפים חורי ניקוז.";

export const supportGroups = [
  {
    id: "fdm",
    label: "פילמנט (FDM)",
    color: "--t-fdm",
    types: [
      {
        id: "normal",
        name: "Normal supports",
        kind: "normal",
        modes: ["bare", "with", "removed"],
        how: "עמודים או קווים אנכיים מתחת לבליטה, עם שכבה צפופה יותר (interface) ממש מתחת לחלק. הדרך הוותיקה והפשוטה.",
        callsIt: [["Cura", "Normal"], ["PrusaSlicer", "Grid, Snug"], ["OrcaSlicer", "Normal (Grid, Snug)"], ["Bambu Studio", "Normal (Grid, Snug)"]],
        note: "ב־PrusaSlicer: Grid יציב יותר וקל יותר להסרה. Snug חוסך חומר ומקטין סימנים, אבל העמודים פחות יציבים והסרה קשה יותר.",
        ratings: { material: 2, surface: 2, removal: 3, setup: 5 },
        pros: ["יציב ואמין", "מחזיק גם בליטות רחבות ושטוחות", "קל להבין ולהגדיר"],
        cons: ["משאיר סימנים על התחתית", "משתמש בהרבה חומר ובזמן הדפסה"],
        whenToUse: "בליטות רחבות ושטוחות, ומבנים גדולים שאי אפשר לסובב.",
      },
      {
        id: "tree",
        name: "Tree supports",
        kind: "tree",
        modes: ["bare", "with", "removed"],
        how: "גזע שמסתעף לענפים דקים שנוגעים בחלק רק בנקודות בודדות. פחות חומר, פחות סימנים.",
        callsIt: [["Cura", "Tree"], ["PrusaSlicer", "Organic"], ["OrcaSlicer", "Tree (Slim, Strong, Hybrid, Organic)"], ["Bambu Studio", "Tree (Slim, Strong, Hybrid, Organic)"]],
        note: "הווריאציה Hybrid משלבת עצים עם תמיכה רגילה מתחת למשטחים שטוחים גדולים, כי ענפים דקים פחות יציבים שם.",
        ratings: { material: 4, surface: 4, removal: 4, setup: 4 },
        pros: ["חוסך חומר וזמן", "סימנים קטנים בנקודות מגע בלבד", "מגיע למקומות צרים ומסובכים"],
        cons: ["פחות יציב מתחת למשטחים רחבים ושטוחים", "מצריך סלייסר שתומך בכך"],
        whenToUse: "פסלונים, בליטות קטנות וצורות אורגניות.",
      },
      {
        id: "soluble",
        name: "Soluble supports",
        kind: "soluble",
        modes: ["bare", "with", "removed"],
        how: "תמיכות מחומר שמתמוסס בנוזל, ומודפסות בחומר שני. PVA ו־BVOH מתמוססים במים, ו־HIPS מתמוסס בממס limonene (בהדפסת ABS). אחרי ההדפסה מכניסים את החלק לאמבט והתמיכות נעלמות.",
        ratings: { material: 2, surface: 5, removal: 5, setup: 1 },
        pros: ["משטח נקי בלי סימני הסרה", "מגיע גם לחללים פנימיים שאי אפשר להגיע אליהם", "אין צורך בהסרה ידנית"],
        cons: ["דורש מדפסת שמדפיסה כמה חומרים", "שלב נוסף של המסה", "בממס צריך להתייחס לבטיחות"],
        whenToUse: "גאומטריות מסובכות וחללים סגורים, כשהמשטח התחתון חשוב.",
        needs: "דורש מדפסת רב־חומרית, למשל מערכת MMU או מדפסת רב־כלי. PLA מתאים ל־PVA או BVOH, ו־PETG בעצם רק ל־BVOH (לפי Prusa).",
      },
    ],
  },
  {
    id: "resin",
    label: "שרף",
    color: "--t-sla",
    types: [
      {
        id: "resin-light",
        name: "Light supports",
        kind: "resin-light",
        modes: ["with", "removed"],
        modeLabels: { with: "עם תמיכות", removed: "אחרי הסרה" },
        how: "תמיכות דקות עם טיפים קטנים. משאירות סימנים קטנים, אבל אוחזות פחות.",
        ratings: { hold: 2, surface: 5, removal: 5 },
        pros: ["סימנים קטנים וקלים לשיוף", "הסרה קלה", "מתאים לפרטים עדינים"],
        cons: ["עלול להישבר בזמן הקילוף", "לא לחלקים כבדים"],
        whenToUse: "מיניאטורות, חלקים קלים ופרטים עדינים.",
        needs: RESIN_TIP,
      },
      {
        id: "resin-medium",
        name: "Medium supports",
        kind: "resin-medium",
        modes: ["with", "removed"],
        modeLabels: { with: "עם תמיכות", removed: "אחרי הסרה" },
        how: "איזון בין אחיזה לסימנים. נקודת ההתחלה לרוב החלקים.",
        ratings: { hold: 3, surface: 4, removal: 4 },
        pros: ["איזון טוב", "מתאים לרוב החלקים"],
        cons: ["לא אידיאלי לחלקים כבדים מאוד או עדינים מאוד"],
        whenToUse: "ברירת מחדל לחלקים בגודל בינוני.",
        needs: RESIN_TIP,
      },
      {
        id: "resin-heavy",
        name: "Heavy supports",
        kind: "resin-heavy",
        modes: ["with", "removed"],
        modeLabels: { with: "עם תמיכות", removed: "אחרי הסרה" },
        how: "תמיכות עבות עם טיפים גדולים. אחיזה חזקה, וסימנים גדולים.",
        ratings: { hold: 5, surface: 2, removal: 2 },
        pros: ["אחיזה חזקה", "מתאים לחלקים כבדים וגדולים"],
        cons: ["סימנים גדולים שקשה לשייף", "קשה להסרה"],
        whenToUse: "חלקים כבדים וגדולים, או כשהחלק נופל מהפלטה.",
        needs: RESIN_TIP,
      },
    ],
  },
  {
    id: "metal",
    label: "מתכת",
    color: "--t-industrial",
    types: [
      {
        id: "metal",
        name: "Metal supports",
        kind: "metal",
        modes: ["bare", "with", "removed"],
        how: "עמודים צפופים מחברים את החלק לפלטה. הם מעגנים אותו, כדי שלחץ פנימי לא יסלסל אותו (curling), ומוליכים חום החוצה.",
        pros: ["מונעים עיוות מלחץ פנימי", "מאפשרים בליטות"],
        cons: ["חייבים לחתוך אותם אחרי ההדפסה", "משאירים משטח שצריך עיבוד"],
        whenToUse: "כמעט כל חלק מתכת שמודפס בשיטת אבקה על פלטה.",
        needs: "מנתקים את החלק מהפלטה בחיתוך, למשל במסור או ב־wire EDM, ואחר כך מטפלים בחום ומעבדים משטחים.",
      },
    ],
  },
  {
    id: "powder",
    label: "אבקה",
    color: "--t-sls",
    types: [
      {
        id: "powder",
        name: "Powder bed (no supports)",
        kind: "powder",
        modes: ["with", "removed"],
        modeLabels: { with: "בתוך האבקה", removed: "אחרי הוצאה" },
        how: "האבקה שלא נמזגה נשארת סביב החלק ותומכת בו, ולכן בפלסטיק (SLS ו־MJF) אין צורך בתמיכות.",
        pros: ["בלי סימני תמיכה", "אפשר ליצור בליטות וחללים פנימיים", "אין שלב הסרה"],
        cons: ["צריך לנקות אבקה מהחלק, בדרך כלל בהתזת חרוזים", "חללים סגורים לא מנוקים לגמרי"],
        whenToUse: "SLS ו־MJF: חלקים מורכבים בלי תמיכות.",
        needs: "חללים פנימיים חייבים פתח, כדי שהאבקה תוכל לצאת.",
      },
    ],
  },
];

/** FDM settings worth knowing (English names as they appear in slicers). */
export const supportSettings = [
  { name: "Overhang angle", meaning: "הזווית שמעליה מוסיפים תמיכות. ברירת המחדל שונה בין סלייסרים (ב־Cura 50°, ב־PrusaSlicer זיהוי אוטומטי), ואפשר להתאים אותה ליכולת המדפסת." },
  { name: "Support Z distance", meaning: "הרווח האנכי בין התמיכה לחלק. רווח קטן נותן משטח טוב יותר אבל קשה יותר להסרה. ב־Cura ברירת המחדל 0.1 מ״מ, וב־Prusa 0.2 מ״מ (בערך 50–75% מגובה השכבה עובד היטב)." },
  { name: "Support density", meaning: "כמה צפופות התמיכות. צפוף יותר מחזיק טוב יותר ומשאיר יותר סימנים. ב־Cura ברירת המחדל 15%." },
  { name: "Interface layers", meaning: "שכבות צפופות בין התמיכה לחלק, שמשפרות את המשטח שמעליהן. ב־PrusaSlicer וב־OrcaSlicer ברירת המחדל 3." },
  { name: "Build plate only", meaning: "תמיכות שמתחילות רק מהמיטה (ב־Cura: Touching Buildplate), ולא מעל חלקים אחרים של הדגם." },
  { name: "Blockers / enforcers", meaning: "אזורים שמסמנים בעצמכם: איפה לא להוסיף תמיכה (blocker), ואיפה כן (enforcer). ב־Cura: Anti Overhang Mesh." },
];

/** Adhesion aids: help the part stick to the plate. They are not supports. */
export const adhesion = [
  { name: "Brim", meaning: "שכבה שטוחה סביב בסיס החלק, שמגדילה את שטח המגע עם המיטה ומונעת עיוות. Prusa ממליצה על רוחב של לפחות 3 מ״מ." },
  { name: "Raft", meaning: "רשת עבה עם גג מתחת לכל החלק, והחלק מודפס עליה. מועיל נגד עיוות, למשל ב־ABS." },
  { name: "Skirt", meaning: "קו סביב החלק שלא נוגע בו. מייצב את זרימת הפלסטיק לפני ההדפסה ומאפשר לבדוק את השכבה הראשונה." },
];

export const avoidTips = [
  "סובבו את החלק: זה הכלי הראשון להפחתת תמיכות, ומשטח שמודפס ישר על המיטה יוצא חלק",
  "בליטות של 45° עד כ־60° מודפסות בדרך כלל נקי, בהתאם לפיה ולקירור (Prusa)",
  "גשרים אופקיים קצרים עוברים בלי תמיכה",
  "במקום עיגול (fillet) הפונה למיטה, שיפוע (chamfer) נותן בליטה מתונה יותר",
  "פצלו את הדגם לשני חלקים בעלי בסיס שטוח, והדביקו",
];
