// A chave do gameData.json e o proprio titulo; os ficheiros de imagem usam o
// titulo sem pontuacao ("Counter-Strike 2" -> "CounterStrike 2.png").
const clean = (title) => title.replace(/[^\w\s]/gi, '');

export const posterSrc = (title) => `${process.env.PUBLIC_URL}/posters/${clean(title)}.png`;
export const backdropSrc = (title) => `${process.env.PUBLIC_URL}/backgrounds/${clean(title)}.png`;
export const pfpSrc = (displayName) => `${process.env.PUBLIC_URL}/pfp/${displayName}.png`;

// Icone do hub dos Biladeiros, na navbar. E o favicon do hub, extraido do .ico
// (170 kB) e reduzido a 64px -> 4 kB.
export const hubIconSrc = () => `${process.env.PUBLIC_URL}/hub.png`;
