/**
 * Print Day: the step machine. It only knows which step the player is on and how many retries a step
 * has had; it never draws anything (the screens in lib/game/steps/ do that).
 *
 * @param {string[]} stepIds in play order
 * @returns {{
 *   readonly index:number, readonly id:string, readonly count:number,
 *   next:()=>void, back:()=>void, goTo:(i:number)=>void, restart:()=>void,
 *   retry:()=>number, retries:()=>number,
 *   onChange:(fn:(state:{index:number,id:string})=>void)=>void
 * }}
 */
export function createGame(stepIds) {
  let index = 0;
  const misses = Object.fromEntries(stepIds.map((id) => [id, 0]));
  const listeners = [];
  const emit = () => listeners.forEach((fn) => fn({ index, id: stepIds[index] }));
  const goTo = (i) => {
    const next = Math.max(0, Math.min(stepIds.length - 1, i));
    if (next === index) return;
    index = next;
    emit();
  };

  return {
    get index() { return index; },
    get id() { return stepIds[index]; },
    count: stepIds.length,
    next: () => goTo(index + 1),
    back: () => goTo(index - 1),
    goTo,
    /** start over from step 1 and forget all retries */
    restart() {
      stepIds.forEach((id) => (misses[id] = 0));
      index = 0;
      emit();
    },
    /** call after a miss; returns how many misses this step has now (2 misses -> show a hint) */
    retry: () => ++misses[stepIds[index]],
    retries: () => misses[stepIds[index]],
    onChange: (fn) => listeners.push(fn),
  };
}
