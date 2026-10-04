// Use cases: what people print, and what to print it with. Edit freely.
//
// Fields:
//   summary          what matters for this kind of part (one or two sentences)
//   recommendations  [{techId, materialIds[], why}]: a technology, the materials that suit it, and ONE line saying why.
//                    Ordered best-first. Industrial technologies (dmls, binder) have no material list yet: use [].
//   avoid            optional {materialIds[], why}: materials that look tempting but are the wrong choice here.
//
// These are rules of thumb for choosing, not guarantees: the same part can fail with the "right" material
// if the settings are wrong (see the troubleshooting section).

export const useCases = [
  {
    id: "prototyping",
    name: "אבות־טיפוס",
    summary: "בודקים צורה, התאמה ורעיונות. מהירות ויכולת לשנות מהר חשובות יותר מחוזק.",
    recommendations: [
      { techId: "fdm", materialIds: ["pla", "petg"], why: "הדפסה מהירה וקלה לשינוי, וחזקה מספיק לבדיקת צורה והתאמה." },
      { techId: "msla", materialIds: ["resin-standard"], why: "כשצריך משטח חלק ופרטים עדינים לדגם הצגה." },
      { techId: "mjf", materialIds: ["pa12"], why: "אב־טיפוס שמתנהג כמו חלק סופי, בלי תמיכות." },
    ],
  },
  {
    id: "functional",
    name: "חלקים פונקציונליים ומכניים",
    summary: "חלקים שנושאים עומס, נעים או נשחקים: צירים, גלגלי שיניים, תושבות.",
    recommendations: [
      { techId: "fdm", materialIds: ["nylon", "petg", "composite"], why: "ניילון עמיד לשחיקה, PETG קשוח וקל, וסיבים מוסיפים קשיחות." },
      { techId: "mjf", materialIds: ["pa12"], why: "חלקים צפופים וחזקים בכל הכיוונים, כולל מבנים מורכבים." },
      { techId: "sls", materialIds: ["pa12", "pa11"], why: "בלי תמיכות, ואפשר ליצור מנגנון שלם בחלק אחד." },
      { techId: "msla", materialIds: ["resin-tough"], why: "חלקים קטנים ומדויקים שעומדים בעומס מתון." },
    ],
    avoid: { materialIds: ["pla", "resin-standard"], why: "נוקשים אבל שבירים ומתרככים בחום, ולכן נכשלים תחת עומס." },
  },
  {
    id: "outdoor",
    name: "חלקים לחוץ",
    summary: "שמש, גשם וחום משנים את הפלסטיק עם הזמן. עמידות ל־UV וללחות חשובה יותר מקלות ההדפסה.",
    recommendations: [
      { techId: "fdm", materialIds: ["asa"], why: "עמיד לשמש ולמזג אוויר, ולכן הבחירה הראשונה לחוץ." },
      { techId: "fdm", materialIds: ["petg"], why: "חלופה קלה יותר להדפסה, עמידה ללחות." },
      { techId: "sls", materialIds: ["pa11"], why: "ניילון שעמיד לשמש יותר מ־PA12, ומתאים לחלקים מורכבים." },
    ],
    avoid: { materialIds: ["pla", "resin-standard"], why: "PLA מתרכך בחום, ושרפים מצהיבים ונסדקים בשמש." },
  },
  {
    id: "miniatures",
    name: "מיניאטורות ופסלונים",
    summary: "פרטים קטנים, פנים וטקסטורות. הפירוט והמשטח החלק הם העיקר.",
    recommendations: [
      { techId: "msla", materialIds: ["resin-standard"], why: "פיקסלים קטנים מדפיסים פרצופים וטקסטורות בפירוט גבוה." },
      { techId: "sla", materialIds: ["resin-standard"], why: "לייזר עדין לדגמים קטנים במיוחד." },
      { techId: "fdm", materialIds: ["pla"], why: "לפסלים גדולים וקלים לצביעה, כשמקבלים קווי שכבות." },
    ],
  },
  {
    id: "jewelry",
    name: "תכשיטים ויציקה",
    summary: "מדפיסים דגם, ובשיטת השעווה האבודה יוצקים אותו במתכת. הדגם צריך להישרף נקי.",
    recommendations: [
      { techId: "msla", materialIds: ["resin-castable"], why: "נשרף כמעט בלי שאריות, ולכן אפשר לצקת ממנו מתכת." },
      { techId: "sla", materialIds: ["resin-castable"], why: "פירוט עדין לדגמי תכשיטים." },
      { techId: "dmls", materialIds: [], why: "הדפסת מתכת ישירה בתעשייה, בלי שלב יציקה." },
    ],
    avoid: { materialIds: ["resin-standard"], why: "משאיר שאריות בשריפה ופוגם ביציקה." },
  },
  {
    id: "dental",
    name: "רפואה ודנטלי",
    summary: "דגמים, מדריכי ניתוח ואביזרים שנוגעים בגוף. הכול חייב להיות מאושר ומתועד.",
    recommendations: [
      { techId: "msla", materialIds: ["resin-dental"], why: "שרפים מאושרים לשימוש רפואי, ומדויקים לדגמים ולמדריכי ניתוח." },
      { techId: "sla", materialIds: ["resin-dental"], why: "אותו שרף עם פירוט גבוה." },
      { techId: "mjf", materialIds: ["pa12"], why: "אורתוזות ותותבות חיצוניות: חזק, קל ואפשר להתאים אישית." },
    ],
    avoid: { materialIds: ["resin-standard"], why: "לא מאושר למגע עם הגוף. משתמשים רק בשרף שמאושר לכך." },
  },
  {
    id: "cosplay",
    name: "קוספליי ואביזרים",
    summary: "חלקים גדולים, קלים ונוחים ללבישה. חשוב לשייף, לצבוע ולחבר.",
    recommendations: [
      { techId: "fdm", materialIds: ["pla", "petg"], why: "קל להדפיס חלקים גדולים, ללטש ולצבוע." },
      { techId: "fdm", materialIds: ["tpu"], why: "חלקים גמישים שנוחים על הגוף: רצועות וחיבורים." },
      { techId: "msla", materialIds: ["resin-standard"], why: "פרטים קטנים ומשטח חלק: כתרים, תכשיטים ופרטי קישוט." },
    ],
  },
  {
    id: "enclosures",
    name: "מארזים לאלקטרוניקה",
    summary: "קשיחות, עמידות לחום מתון, ודיוק בחורים ובמחברים.",
    recommendations: [
      { techId: "fdm", materialIds: ["petg"], why: "קשוח, עמיד ללחות ומחזיק חום סביר." },
      { techId: "fdm", materialIds: ["asa", "abs"], why: "עמידים יותר בחום, ואפשר להחליק אותם." },
      { techId: "mjf", materialIds: ["pa12"], why: "מארזים מדויקים בלי תמיכות, עם תפסים ומחברים בחלק אחד." },
    ],
    avoid: { materialIds: ["pla"], why: "מתרכך כבר ב־55–60°C, וזה קורה גם ליד אלקטרוניקה שמתחממת." },
  },
  {
    id: "industrial",
    name: "תעשייה ואווירונאוטיקה",
    summary: "חלקים קלים, חזקים ובצורות שקשה לייצר אחרת, וגם כלי עבודה ומתקנים לקו הייצור.",
    recommendations: [
      { techId: "dmls", materialIds: [], why: "חלקי מתכת קלים וחזקים בגאומטריות שאי אפשר לייצר בדרך אחרת." },
      { techId: "mjf", materialIds: ["pa12"], why: "חלקים פונקציונליים בסדרות קטנות ובקצב ייצור גבוה." },
      { techId: "fdm", materialIds: ["pc", "composite"], why: "כלי עבודה ומתקנים שעמידים בחום ובעומס." },
      { techId: "binder", materialIds: [], why: "חלקי מתכת בסדרות גדולות יותר, בלי תמיכות." },
    ],
  },
];
