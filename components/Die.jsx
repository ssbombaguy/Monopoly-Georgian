// Real die face: 3x3 pip grid, positions indexed 0-8 left-to-right, top-to-bottom.
const PIPS = {
  1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};

export default function Die({ n }) {
  return (
    <div className="grid h-12 w-12 grid-cols-3 grid-rows-3 place-items-center rounded-lg border border-ink/20 bg-white p-1.5 shadow-md">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`h-[7px] w-[7px] rounded-full ${PIPS[n].includes(i) ? 'bg-ink' : ''}`} />
      ))}
    </div>
  );
}
