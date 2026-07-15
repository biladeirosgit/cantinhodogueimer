// Adaptadores para a forma do gameData.json: a chave do mapa e o proprio
// titulo do jogo, e alguns campos tem nomes herdados do JSON manual.

// O campo tem mesmo um espaco no nome. Isolado aqui para nenhum componente
// ter de saber disso.
export const chosenBy = (game) => game['chosen by'] || [];

export const clipsOf = (game) => game.clips || [];

// Em que fase do jogo e que o clube jogou. A maioria dos jogos nao tem `phase`
// -- so os que ainda nao estavam lancados como toda a gente os conhece. O
// label vive aqui e nao no JSON: assim uma mudanca de texto e um sitio so, e o
// JSON guarda a chave estavel.
const PHASES = {
    beta: { slug: 'beta', label: 'Beta' },
    'early-access': { slug: 'early-access', label: 'Acesso Antecipado' },
    demo: { slug: 'demo', label: 'Demo' },
};

// Devolve null quando nao ha fase (o caso normal) e tambem quando a chave nao
// existe no mapa: um typo no JSON nao pode rebentar o catalogo inteiro.
//
// O hasOwnProperty nao e paranoia: com `PHASES[game.phase]` a seco, um
// "phase": "toString" no JSON devolvia a funcao herdada do prototipo, e o
// React rebentava a tentar renderiza-la.
export const phaseOf = (game) =>
    (game && Object.prototype.hasOwnProperty.call(PHASES, game.phase) && PHASES[game.phase]) || null;

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
