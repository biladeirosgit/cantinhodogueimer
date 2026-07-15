// A chave do gameData.json e o proprio titulo; os ficheiros de imagem usam o
// titulo sem pontuacao ("Counter-Strike 2" -> "CounterStrike 2.png").
const clean = (title) => title.replace(/[^\w\s]/gi, '');

export const posterSrc = (title) => `${process.env.PUBLIC_URL}/posters/${clean(title)}.png`;
export const backdropSrc = (title) => `${process.env.PUBLIC_URL}/backgrounds/${clean(title)}.png`;
export const pfpSrc = (displayName) => `${process.env.PUBLIC_URL}/pfp/${displayName}.png`;
