// "What should I use?" wizard. Edit questions, wording and weights freely.
//
// How it scores: every option has `weights`, a map from a technology id OR a material id to a number
// (negative = "this answer argues against it"). All chosen options' weights are added up. The
// technology with the highest total wins; then the best-scoring material among the materials
// that technology can print. (Logic: src/lib/recommend.js.)
//
// `meaning` is a short sentence shown in the explanation ("why this result") when that answer
// pushed toward the winner, so write it as a statement about what the answer implies.
// `tieBreak` is the order used when two technologies have exactly the same score
// (the more common one first).

export const wizard = {
  tieBreak: ["fdm", "msla", "sla", "mjf", "sls"],
  questions: [
    {
      id: "strength",
      text: "כמה חזק צריך להיות החלק?",
      options: [
        {
          id: "display",
          label: "לתצוגה או לבדיקת צורה",
          meaning: "לחלק שלא נושא עומס אפשר להשתמש בחומר קל להדפסה.",
          weights: { pla: 2, "resin-standard": 2, fdm: 1, msla: 1 },
        },
        {
          id: "normal",
          label: "עומס רגיל: משתמשים בו ביום־יום",
          meaning: "עומס בינוני מצריך חומר קשוח שלא נשבר בקלות.",
          weights: { petg: 2, asa: 1, abs: 1, pa12: 1, fdm: 1, mjf: 1 },
        },
        {
          id: "high",
          label: "חזק: נושא עומס, נע או נשחק",
          meaning: "חלק מאומץ צריך חומר הנדסי: ניילון, פוליקרבונט או חומר מחוזק סיבים.",
          weights: { nylon: 3, composite: 2, pc: 2, pa12: 3, pa11: 2, "resin-tough": 1, sls: 2, mjf: 2, fdm: 1 },
        },
      ],
    },
    {
      id: "environment",
      text: "איפה החלק יהיה?",
      options: [
        {
          id: "indoor",
          label: "בתוך הבית, בטמפרטורה רגילה",
          meaning: "בתוך הבית אין צורך בעמידות לשמש ולחום.",
          weights: { pla: 1, "resin-standard": 1 },
        },
        {
          id: "outdoor",
          label: "בחוץ או ליד חום: שמש, גשם או מנוע",
          meaning: "חוץ וחום דורשים חומר עמיד ל־UV ולחום, ולא PLA או שרף רגיל.",
          weights: { asa: 4, pa11: 3, abs: 1, pc: 1, pa12: 1, pla: -3, "resin-standard": -2, "resin-tough": -2, "resin-flex": -2 },
        },
      ],
    },
    {
      id: "detail",
      text: "כמה פרטים עדינים צריך?",
      options: [
        {
          id: "coarse",
          label: "פרטים גסים מספיקים",
          meaning: "בלי פרטים עדינים אפשר להשתמש בשיטה הפשוטה ביותר.",
          weights: { fdm: 2, pla: 1, petg: 1 },
        },
        {
          id: "medium",
          label: "פירוט בינוני",
          meaning: "פירוט בינוני מתאים לכמה שיטות.",
          weights: { fdm: 1, sls: 1, mjf: 1, msla: 1 },
        },
        {
          id: "fine",
          label: "עדין מאוד: פנים, טקסטורה וכתב קטן",
          meaning: "פרטים עדינים דורשים שרף ושכבות דקות.",
          weights: { msla: 3, sla: 2, "resin-standard": 2, "resin-tough": 1, fdm: -2, sls: -1, mjf: -1 },
        },
      ],
    },
    {
      id: "handling",
      text: "כמה עבודה סביב ההדפסה מקובלת עליך?",
      options: [
        {
          id: "minimal",
          label: "הכי פחות: להדפיס ולהוציא",
          meaning: "בלי נוזלים, אדים או שטיפה, ולכן מדפסת פילמנט.",
          weights: { fdm: 3, pla: 1, petg: 1, msla: -2, sla: -2, sls: -3, mjf: -3 },
        },
        {
          id: "gloves",
          label: "מוכן לכפפות, שטיפה והקשיה",
          meaning: "אפשר לעבוד עם שרף: כפפות, אוורור, שטיפה והקשיה.",
          weights: { msla: 2, sla: 1 },
        },
        {
          id: "service",
          label: "אשלח לנותן שירות",
          meaning: "כשמזמינים מנותן שירות אפשר להשתמש גם בהדפסת אבקה תעשייתית.",
          weights: { sls: 3, mjf: 3, pa12: 1, pa11: 1 },
        },
      ],
    },
  ],
};
