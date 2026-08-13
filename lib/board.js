// Presentation-only copy of server/src/game/board.js — the server never
// trusts this. Move to a shared package when it changes a second time.
// rent[0] is base, rent[1..4] houses, rent[5] hotel — canonical US values.
export const TOKENS = ['🎩', '🚗', '⛵', '🐑', '🍷', '🥟', '🍇', '🏔️'];

export const GROUP_COLORS = {
  brown: '#955436', lightblue: '#aae0fa', pink: '#d93a96', orange: '#f7941d',
  red: '#ed1b24', yellow: '#fef200', green: '#1fb25a', darkblue: '#0072bb',
};

// Mirrors rentFor() in the server engine — display only, never trusted.
export function rentFor(room, index, diceSum = 7) {
  const tile = TILES[index];
  const ownerId = room.properties[index];
  if (!ownerId) return 0;

  if (tile.type === 'property') {
    const houses = room.houses?.[index] || 0;
    if (houses > 0) return tile.rent[houses];
    const ownsAll = TILES.every((t, i) => t.group !== tile.group || room.properties[i] === ownerId);
    return tile.rent[0] * (ownsAll ? 2 : 1);
  }
  if (tile.type === 'rail') {
    const n = TILES.reduce((acc, t, i) => acc + (t.type === 'rail' && room.properties[i] === ownerId ? 1 : 0), 0);
    return 25 * 2 ** (n - 1);
  }
  if (tile.type === 'utility') {
    const both = TILES.every((t, i) => t.type !== 'utility' || room.properties[i] === ownerId);
    return diceSum * (both ? 10 : 4);
  }
  return 0;
}

const P = (name, price, group, rent, houseCost) => ({
  type: 'property', name, price, group, rent, houseCost, mortgage: price / 2,
});
const R = (name) => ({ type: 'rail', name, price: 200, mortgage: 100, icon: 'rail' });
const U = (name, icon) => ({ type: 'utility', name, price: 150, mortgage: 75, icon });
const CH = () => ({ type: 'chance', name: 'შანსი', icon: 'chance' });
const CC = () => ({ type: 'chest', name: 'საზ. ყუთი', icon: 'chest' });

export const TILES = [
  { type: 'go', name: 'დაწყება', icon: 'go' },                                             // 0
  P('ვარკეთილი', 60, 'brown', [2, 10, 30, 90, 160, 250], 50),
  CC(),
  P('გლდანი', 60, 'brown', [4, 20, 60, 180, 320, 450], 50),
  { type: 'tax', name: 'საშემოსავლო', amount: 200, icon: 'tax' },                          // 4
  R('სადგური თბილისი'),                                                                     // 5
  P('ისანი', 100, 'lightblue', [6, 30, 90, 270, 400, 550], 50),
  CH(),
  P('დიღომი', 100, 'lightblue', [6, 30, 90, 270, 400, 550], 50),
  P('მარჯანიშვილი', 120, 'lightblue', [8, 40, 100, 300, 450, 600], 50),
  { type: 'jail', name: 'ციხე', icon: 'jail' },                                             // 10
  P('პეკინის ქუჩა', 140, 'pink', [10, 50, 150, 450, 625, 750], 100),
  U('ენგურჰესი', 'power'),                                                                   // 12
  P('აღმაშენებლის', 140, 'pink', [10, 50, 150, 450, 625, 750], 100),
  P('ბორჯომი', 160, 'pink', [12, 60, 180, 500, 700, 900], 100),
  R('სადგური ქუთაისი'),                                                                      // 15
  P('ბაკურიანი', 180, 'orange', [14, 70, 200, 550, 750, 950], 100),
  CC(),
  P('გუდაური', 180, 'orange', [14, 70, 200, 550, 750, 950], 100),
  P('ყაზბეგი', 200, 'orange', [16, 80, 220, 600, 800, 1000], 100),
  { type: 'parking', name: 'უფასო პარკინგი', icon: 'parking' },                             // 20
  P('მცხეთა', 220, 'red', [18, 90, 250, 700, 875, 1050], 150),
  CH(),
  P('სიღნაღი', 220, 'red', [18, 90, 250, 700, 875, 1050], 150),
  P('თელავი', 240, 'red', [20, 100, 300, 750, 925, 1100], 150),
  R('სადგური ბათუმი'),                                                                       // 25
  P('ვაჟა-ფშაველა', 260, 'yellow', [22, 110, 330, 800, 975, 1150], 150),
  P('საბურთალო', 260, 'yellow', [22, 110, 330, 800, 975, 1150], 150),
  U('თბილისის წყალი', 'water'),                                                              // 28
  P('ჭავჭავაძის', 280, 'yellow', [24, 120, 360, 850, 1025, 1200], 150),
  { type: 'gotojail', name: 'ციხეში', icon: 'police' },                                     // 30
  P('ვაკე', 300, 'green', [26, 130, 390, 900, 1100, 1275], 200),
  P('მთაწმინდა', 300, 'green', [26, 130, 390, 900, 1100, 1275], 200),
  CC(),
  P('თბილისის ზღვა', 320, 'green', [28, 150, 450, 1000, 1200, 1400], 200),
  R('სადგური ფოთი'),                                                                          // 35
  CH(),
  P('რუსთაველის', 350, 'darkblue', [35, 175, 500, 1100, 1300, 1500], 200),
  { type: 'tax', name: 'ფუფუნების', amount: 100, icon: 'luxury' },                          // 38
  P('თავისუფლების', 400, 'darkblue', [50, 200, 600, 1400, 1700, 2000], 200),
];
