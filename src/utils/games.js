// Adaptadores para a forma do gameData.json: a chave do mapa e o proprio
// titulo do jogo, e alguns campos tem nomes herdados do JSON manual.

// O campo tem mesmo um espaco no nome. Isolado aqui para nenhum componente
// ter de saber disso.
export const chosenBy = (game) => game['chosen by'] || [];

export const clipsOf = (game) => game.clips || [];

// Achata os clips de todos os jogos, anotando o jogo de origem.
export const allClips = (gameData) =>
    Object.entries(gameData).flatMap(([title, game]) =>
        (game.clips || []).map((clip) => ({ ...clip, game: title }))
    );

// As tags do backloggd misturam generos com modos de jogo e perspetivas.
// Separa-las torna os rankings da /stats legiveis: sem isto, os "generos mais
// jogados" seriam Multiplayer / Single player / Third person, que nao dizem
// nada sobre o que o clube joga.
const MODE_TAGS = new Set([
    'Single player',
    'Multiplayer',
    'Co-operative',
    'Split screen',
    'First person',
    'Third person',
    'Side view',
    'Bird view / Isometric',
    'Virtual Reality',
    'Themes',
]);

export const isModeTag = (tag) => MODE_TAGS.has(tag);
