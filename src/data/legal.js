// Legal pages (accessibility statement, privacy, terms): ALL wording and the owner's details live here.
//
// !! BEFORE PUBLISHING: fill in `owner` below and run `npm run check:legal` (it fails while anything is missing).
// !! The texts are a good-faith TEMPLATE written for this site as it is today. They are not legal advice:
//    have them reviewed by a lawyer, and (for the accessibility statement) by a certified accessibility
//    specialist if the law requires an expert opinion for your kind of site. Change `audit` when that happens.
//
// Why these three pages: Israeli law requires a published accessibility statement (Equal Rights for Persons
// with Disabilities regulations, Service Accessibility Adjustments, 2013, which point to the standard SI 5568,
// level AA, based on WCAG 2.0). A privacy statement is good practice even when no data is collected; terms of
// use state the educational purpose and the copyright position.

export const owner = {
  // who runs the site (a person or a business name)
  operatorName: "",
  // general contact for any question about the site
  contactEmail: "",
  // accessibility contact: a person who handles accessibility requests (the site owner is fine for a small site)
  coordinatorName: "",
  coordinatorEmail: "",
  coordinatorPhone: "",
  // date the statement was last updated, as YYYY-MM-DD
  statementDate: "2026-10-04",
  // how many working days you promise to answer an accessibility request in
  responseDays: 7,
  // who hosts the site (fill in once known), e.g. "GitHub Pages". Used in the privacy page.
  hosting: "",
  // "none" until an outside accessibility specialist has checked the site; then "external" and the date below
  audit: "none",
  auditDate: "",
};

/** Hebrew date for the pages: 2026-10-04 -> 4 באוקטובר 2026. */
export function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  return `${d} ב${months[m - 1]} ${y}`;
}

// ---- Accessibility statement ----
export const accessibility = {
  intro: "אנו מאמינים שכל אחד ואחת צריכים להיות מסוגלים ללמוד על הדפסת תלת־ממד, וכך גם אנשים עם מוגבלות. לכן השקענו בהנגשת האתר, והשירות כולו ניתן לשימוש עצמאי ושוויוני.",
  standard: {
    title: "רמת הנגישות",
    paragraphs: [
      "האתר מותאם לדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג–2013, ולתקן הישראלי ת״י 5568 לנגישות תכנים באינטרנט ברמה AA, המבוסס על הנחיות WCAG 2.0 הבינלאומיות.",
    ],
    // shown depending on owner.audit
    selfChecked: "ההתאמות נבדקו על ידינו בבדיקות אוטומטיות ובבדיקה ידנית. עד כה לא בוצעה בדיקת נגישות על ידי גורם מקצועי חיצוני.",
    externalChecked: (date) => `האתר נבדק על ידי מומחה נגישות חיצוני, ביקורת מתאריך ${date}.`,
  },
  done: {
    title: "התאמות שבוצעו באתר",
    items: [
      "אפשר לנווט באתר ולהפעיל את כל חלקיו באמצעות המקלדת בלבד, עם סימון ברור של האלמנט הפעיל.",
      "קישור ״דלג לתוכן״ בתחילת כל דף.",
      "מבנה כותרות ברור, ואזורי עמוד מסומנים לקוראי מסך.",
      "האתר בעברית ובכיוון כתיבה מימין לשמאל. מונחים באנגלית מסומנים בשפתם.",
      "ניגודיות צבעים של לפחות 4.5:1 בכל הטקסטים, ולפחות 3:1 באיורים ובסימונים. אפשר גם לעבור למצב ניגודיות גבוהה.",
      "לכל תרשים ואיור יש תיאור טקסטואלי לקוראי מסך. מידע לא מועבר בצבע בלבד.",
      "האתר מכבד את הגדרת ״הפחתת תנועה״ של מערכת ההפעלה, ובתפריט הנגישות, הזמין בכל עמוד, אפשר להשהות את כל האנימציות ולהפעיל אותן מחדש בכל עת.",
      "האתר מותאם לטלפונים, לטאבלטים ולמחשבים, ולהגדלת טקסט עד 200% ללא אובדן תוכן.",
      "אין באתר תוכן מהבהב, שמע שמתנגן לבד, הגבלות זמן או חלונות קופצים.",
      "אין באתר טפסים לאיסוף פרטים, ואין הרשמה או כניסה לחשבון.",
    ],
  },
  tool: {
    title: "כלי הנגישות באתר",
    text: "בכל דף יש כפתור ״תפריט נגישות״ בפינה. הוא מאפשר להגדיל את הטקסט, להפעיל ניגודיות גבוהה או גווני אפור, להדגיש קישורים, לעבור לגופן קריא, להגדיל ריווח טקסט וסמן, להדגיש את המיקוד ולהשהות אנימציות. ההגדרות נשמרות רק במכשיר שלכם.",
  },
  limits: {
    title: "מגבלות ידועות",
    text: "למרות מאמצינו, ייתכן שנותרו חלקים באתר שטרם הונגשו במלואם. תרשימים ואנימציות מסבירים תהליכים באופן חזותי, ולכל אחד מהם מצורף תיאור טקסטואלי קצר שעשוי להיות מצומצם יותר מהמידע החזותי. אם נתקלתם בקושי, נשמח שתפנו אלינו ונטפל בכך.",
  },
  contact: {
    title: "פניות בנושא נגישות",
    text: (days) => `אם נתקלתם בבעיה, או שיש לכם הצעה לשיפור, אפשר לפנות אלינו. נשתדל להשיב תוך ${days} ימי עבודה.`,
  },
};

// ---- Privacy ----
export const privacy = {
  intro: "בקצרה: האתר לא אוסף עליכם מידע.",
  sections: [
    {
      title: "מה האתר לא עושה",
      items: [
        "אין באתר טפסים, הרשמה, חשבונות משתמשים או תגובות.",
        "האתר לא משתמש בעוגיות (cookies) ולא בכלי ניתוח, מדידה, פרסום או מעקב.",
        "האתר לא טוען תוכן, גופנים או קוד משרתים של צד שלישי: הכול נטען מאותו אתר.",
        "האתר לא אוסף, לא מוכר ולא מעביר מידע אישי.",
      ],
    },
    {
      title: "מה נשמר במכשיר שלכם",
      text: "כדי לזכור הגדרות שבחרתם, האתר שומר בדפדפן שלכם (באחסון המקומי) את הגדרות תפריט הנגישות ואת מצב התפריט הצדדי (פתוח או סגור). המידע הזה נשאר במכשיר שלכם, לא נשלח לשום מקום, ואפשר למחוק אותו בכל עת דרך הגדרות הדפדפן.",
    },
    {
      title: "יומני שרת",
      text: (hosting) => `${hosting ? `האתר מאוחסן אצל ${hosting}.` : ""} כמו בכל אתר, ספק האחסון עשוי לשמור יומני גישה טכניים סטנדרטיים (למשל כתובת IP ושעת הגישה) לצורכי אבטחה ותפעול. הטיפול בהם כפוף למדיניות הפרטיות של ספק האחסון.`,
    },
    {
      title: "פנייה אלינו",
      text: "אם פניתם אלינו בדוא״ל, נשתמש בפרטים שמסרתם רק כדי להשיב לכם, ולא נעביר אותם הלאה.",
    },
  ],
};

// ---- Terms of use ----
export const terms = {
  intro: "האתר הוא מדריך לימודי כללי על הדפסת תלת־ממד. השימוש בו כפוף לתנאים האלה.",
  sections: [
    {
      title: "תוכן לימודי בלבד",
      text: "התכנים באתר נועדו ללמד ולהסביר, והם אינם ייעוץ מקצועי, הנדסי או בטיחותי. הנתונים והדירוגים הם טווחים אופייניים והערכות משוות, והתוצאות בפועל תלויות במכונה, בחומר ובהגדרות. אין להסתמך על האתר לצורך החלטה שיש בה סיכון, למשל טיפול בחומרים, אדים או חלקים נושאי עומס. מומלץ לפעול לפי הוראות היצרן של המכונה והחומר.",
    },
    {
      title: "אחריות",
      text: "התכנים מוצגים כפי שהם. עשינו מאמץ לדייק, אך לא נישא באחריות לנזק שנגרם משימוש באתר או מהסתמכות על האמור בו, ככל שהדבר מותר על פי דין.",
    },
    {
      title: "זכויות יוצרים",
      text: (owner) => `התכנים, האיורים והאנימציות באתר הם בבעלות ${owner || "בעל האתר"}. מותר לצפות בהם ולקשר אליהם. העתקה, הפצה או פרסום מחדש של התכנים, בשלמותם או בחלקם, מחייבים אישור מראש ובכתב.`,
    },
    {
      title: "שמות וסימנים מסחריים",
      text: "שמות של תוכנות, חברות ומוצרים המוזכרים באתר, למשל Cura, PrusaSlicer, OrcaSlicer ו־Bambu Studio, הם סימנים מסחריים של בעליהם. האזכור נועד לצורך הסבר בלבד, ואינו מעיד על קשר או על חסות. האתר אינו מפרסם מחירים ואינו ממליץ על רכישה.",
    },
    {
      title: "שינויים",
      text: "אנו עשויים לעדכן את האתר ואת התנאים האלה מעת לעת. הנוסח המעודכן יפורסם בדף זה.",
    },
    {
      title: "דין וסמכות שיפוט",
      text: "על השימוש באתר יחולו דיני מדינת ישראל, ולבתי המשפט המוסמכים בה הסמכות הבלעדית לדון בכל סכסוך הנוגע אליו.",
    },
  ],
};

// ---- Footer links ----
export const footerLinks = [
  { id: "accessibility", label: "הצהרת נגישות" },
  { id: "privacy", label: "מדיניות פרטיות" },
  { id: "terms", label: "תנאי שימוש" },
];
