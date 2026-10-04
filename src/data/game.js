// Print Day (the game): ALL wording and per-object details live here. Editing text never touches code.
// Design: docs/superpowers/specs/2026-10-04-print-day-game-design.md
//
// Rules for the text: one short sentence per prompt, plain words, no prices, failure is explained kindly.
// English terms (G-code, infill) are written as-is; the page wraps them with bidi().
//
// MODEL SPACE (used by the step drawings AND the finale, so every object is described once):
//   x = left/right, z = front/back, y = up (0 = the print bed). Roughly: height <= 100, width <= 100.
//   parts[]  the object, built from simple shapes. `at` is the centre of the part's bottom face,
//            `size` is [width, height, depth]. shape: "ellipsoid" | "box" | "cylinder" | "cone"
//            (cone = round base tapering to a point at the top).
//   supports[] the spots the player taps in step 4. `needs: true` = a real overhang (nothing underneath).
//            `needs: false` = a decoy: it looks scary but prints fine. `why` is the one-line explanation shown after the tap.
//   hole     where the gap in the mesh is (step 2): { at:[x,y,z] }.

export const steps = [
  { id: "choose", title: "בחירת דגם" },
  { id: "repair", title: "תיקון הדגם" },
  { id: "slice", title: "חיתוך לשכבות" },
  { id: "supports", title: "תמיכות" },
  { id: "firstLayer", title: "שכבה ראשונה" },
  { id: "finish", title: "סיום" },
];

export const objects = [
  {
    id: "cat",
    name: "חתול",
    blurb: "פסלון חתול יושב עם זנב מורם.",
    parts: [
      { id: "body", shape: "ellipsoid", at: [0, 0, 0], size: [44, 54, 36] },
      { id: "head", shape: "ellipsoid", at: [0, 46, 6], size: [38, 30, 30] },
      { id: "ear-l", shape: "cone", at: [-11, 70, 6], size: [10, 16, 8] },
      { id: "ear-r", shape: "cone", at: [11, 70, 6], size: [10, 16, 8] },
      { id: "tail", shape: "ellipsoid", at: [34, 20, 0], size: [30, 9, 9] },
    ],
    hole: { at: [-14, 26, 17], where: "בצד הגוף" },
    supports: [
      { id: "chin", at: [0, 46, 14], label: "מתחת לסנטר", needs: true, why: "הראש רחב מהצוואר, אז מתחת לסנטר אין שום דבר להניח עליו שכבה. צריך תמיכה." },
      { id: "tail", at: [38, 20, 0], label: "הזנב", needs: true, why: "הזנב בולט הצידה מעל המיטה. בלי תמיכה הפלסטיק היה נופל באוויר." },
      { id: "ears", at: [0, 78, 6], label: "האוזניים", needs: false, why: "אוזניים שמצביעות למעלה נבנות על שכבות שכבר קיימות. הן נראות מסוכנות, אבל מודפסות לבד." },
    ],
    finale: "החתול מוכן, שכבה אחרי שכבה.",
  },
  {
    id: "boat",
    name: "ספינה",
    blurb: "ספינה קטנה עם תורן, תא וחרטום בולט.",
    parts: [
      { id: "hull", shape: "box", at: [0, 0, 0], size: [70, 14, 24] },
      { id: "cabin", shape: "box", at: [-8, 14, 0], size: [22, 16, 16] },
      { id: "mast", shape: "cylinder", at: [14, 14, 0], size: [4, 46, 4] },
      { id: "bowsprit", shape: "box", at: [44, 14, 0], size: [22, 4, 6] },
      { id: "rudder", shape: "box", at: [-44, 6, 0], size: [14, 4, 10] },
    ],
    hole: { at: [10, 8, 12], where: "בצד גוף הספינה" },
    supports: [
      { id: "bowsprit", at: [50, 14, 0], label: "החרטום הבולט", needs: true, why: "קצה החרטום בולט מעבר לגוף הספינה. מתחתיו אוויר, ולכן צריך תמיכה." },
      { id: "rudder", at: [-46, 6, 0], label: "ההגה בירכתיים", needs: true, why: "ההגה תלוי מעל המיטה בלי כלום מתחתיו. צריך תמיכה." },
      { id: "mast", at: [14, 50, 0], label: "התורן", needs: false, why: "התורן גבוה ודק, אבל כל שכבה שלו נבנית על השכבה שמתחתיה. אין שום פער, ולכן אין צורך בתמיכה." },
    ],
    finale: "הספינה מוכנה להפלגה.",
  },
  {
    id: "lighthouse",
    name: "מגדלור",
    blurb: "מגדלור עם מרפסת, חדר מנורה וגג.",
    parts: [
      { id: "base", shape: "cylinder", at: [0, 0, 0], size: [34, 10, 34] },
      { id: "tower", shape: "cone", at: [0, 10, 0], size: [26, 48, 26] },
      { id: "gallery", shape: "cylinder", at: [0, 58, 0], size: [34, 4, 34] },
      { id: "lamp", shape: "cylinder", at: [0, 62, 0], size: [14, 12, 14] },
      { id: "roof", shape: "cone", at: [0, 74, 0], size: [18, 12, 18] },
      { id: "ledge", shape: "box", at: [22, 34, 0], size: [16, 3, 10] },
    ],
    hole: { at: [0, 30, 12], where: "בגוף המגדלור" },
    supports: [
      { id: "gallery", at: [0, 58, 17], label: "טבעת המרפסת", needs: true, why: "המרפסת רחבה בהרבה מראש המגדלור. מתחתיה אוויר, ולכן צריך תמיכה." },
      { id: "ledge", at: [26, 34, 0], label: "מרפסת הצד", needs: true, why: "המרפסת בולטת מדופן המגדלור בלי כלום מתחתיה. צריך תמיכה." },
      { id: "roof", at: [0, 76, 9], label: "שולי הגג", needs: false, why: "הגג בולט רק מעט. מדפסת מצליחה לגשר על פער קטן כזה בלי תמיכה." },
    ],
    finale: "המגדלור עומד על הרציף.",
  },
];

// ---- Step 1: choose ----
export const choose = {
  prompt: "איזה דגם מדפיסים היום?",
};

// ---- Step 2: repair the mesh ----
export const repair = {
  prompt: "בדגם יש חור ברשת. מצאו אותו והקישו עליו.",
  hint: "החור מסומן בקו מקווקו. חפשו אותו על הדגם.",
  done: "הרשת סגורה. הסלייסר צריך דגם סגור, בלי חורים.",
};

// ---- Step 3: slice. No wrong answers, only trade-offs. ----
// time / finish: 1-3 dots (3 = more time, smoother surface). layers: how many layers the finale draws.
export const slice = {
  prompt: "הסלייסר חותך את הדגם לשכבות. בחרו עובי שכבה ומילוי.",
  layerHeights: [
    { id: "draft", label: "טיוטה", mm: 0.3, time: 1, finish: 1, layers: 36, line: "מהיר. השכבות עבות, ורואים את הקווים שלהן על המשטח." },
    { id: "standard", label: "רגיל", mm: 0.2, time: 2, finish: 2, layers: 60, line: "איזון טוב בין זמן לגימור. ברירת המחדל הנפוצה." },
    { id: "fine", label: "עדין", mm: 0.1, time: 3, finish: 3, layers: 96, line: "משטח חלק יותר, אבל ההדפסה לוקחת הרבה יותר זמן." },
  ],
  infills: [
    { id: "light", label: "קל", pct: 10, strength: 1, material: 3, line: "חוסך חומר וזמן. מספיק לפסלון שלא נושא משקל." },
    { id: "medium", label: "בינוני", pct: 20, strength: 2, material: 2, line: "בחירה נפוצה: חזק מספיק לרוב הדגמים." },
    { id: "strong", label: "חזק", pct: 40, strength: 3, material: 1, line: "עמיד יותר, אבל איטי וצורך חומר. רק כשבאמת צריך." },
  ],
  summaryLabel: { time: "זמן הדפסה", finish: "גימור", strength: "חוזק", material: "חיסכון בחומר" },
  note: "אין תשובה שגויה. כל בחירה מחליפה זמן בגימור או בחוזק.",
};

// ---- Step 4: supports ----
export const supportsStep = {
  prompt: "סמנו איפה צריך תמיכות: מקומות שבהם הפלסטיק היה נבנה באוויר.",
  hint: "תמיכה צריכה כשמשהו בולט הצידה ואין מתחתיו כלום. חלק שמצביע למעלה לא צריך.",
  allDone: "מצאתם את כל המקומות. התמיכות יתווספו לדגם.",
};

// ---- Step 5: first layer (the failure moment) ----
// result "ok" moves on; the others show a funny failed picture, the hint, and an instant retry (nothing is lost).
export const firstLayer = {
  prompt: "הפיה צריכה להיות במרחק הנכון מהמיטה. כוונו את הגובה.",
  heights: [
    { id: "high", label: "גבוה מדי", result: "high", fail: "הפלסטיק לא נדבק למיטה ונגרר אחרי הפיה כמו ספגטי.", hint: "הפיה רחוקה מדי, ולכן הקו לא נלחץ אל המיטה. נסו להנמיך." },
    { id: "right", label: "מדויק", result: "ok", ok: "הקו הראשון נלחץ קלות אל המיטה ונדבק. עכשיו אפשר להדפיס." },
    { id: "low", label: "נמוך מדי", result: "low", fail: "הפיה חונקת את הפלסטיק: הקו נמעך והפיה כמעט נסתמת.", hint: "הפיה קרובה מדי ואין לפלסטיק מקום לצאת. נסו להגביה." },
  ],
  printing: "מדפיסים שכבה אחרי שכבה...",
};

// ---- Step 6: finish ----
export const finish = {
  prompt: "ההדפסה הסתיימה. הסירו את התמיכות.",
  removed: "התמיכות הוסרו. נשארים עליהן סימנים קטנים, ולכן לפעמים משייפים.",
  summary: (layerLabel, infillLabel) => `הדפסתם בעובי שכבה ${layerLabel} ובמילוי ${infillLabel}.`,
  again: "משחק חדש",
  another: "דגם אחר",
};
