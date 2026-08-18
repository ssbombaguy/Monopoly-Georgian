// Real die face: 3x3 pip grid, positions indexed 0-8 left-to-right, top-to-bottom.
const PIPS = {
  1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};

// Smaller on phones, where the pair shares the turn bar with the buttons.
export default function Die({ n }) {
  return (
    <div className="grid h-9 w-9 grid-cols-3 grid-rows-3 place-items-center rounded-lg border border-ink/20 bg-white p-1 shadow-md sm:h-12 sm:w-12 sm:p-1.5">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`h-[5px] w-[5px] rounded-full sm:h-[7px] sm:w-[7px] ${PIPS[n].includes(i) ? 'bg-ink' : ''}`} />
      ))}
    </div>
  );
}
