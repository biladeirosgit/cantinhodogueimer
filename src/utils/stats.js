import { average } from './ratings';
import { chosenBy } from './games';

// Minimo de jogos em comum para a afinidade ser fiavel. O clube de cinema usa
// 10, calibrado para ~100 filmes; com 15 jogos isso deixaria de fora metade dos
// membros. Com 6, entram todos os regulares e continua a filtrar o ruido (dois
// membros que so partilham 3 jogos podem concordar em 100% por acaso).
const MIN_SHARED = 6;

// Lista de nomes de exibicao que avaliaram pelo menos um jogo.
export const allReviewers = (gameData) => {
    const set = new Set();
    Object.values(gameData).forEach((game) => {
        Object.keys(game.reviews || {}).forEach((name) => set.add(name));
    });
    return Array.from(set);
};

// Afinidade entre dois membros: % de jogos partilhados em que concordam
// (diferenca de nota <= 0.5), so sobre jogos que ambos avaliaram.
// Devolve null se tiverem menos de MIN_SHARED jogos em comum.
export const affinity = (gameData, a, b) => {
    let agree = 0;
    let n = 0;
    Object.values(gameData).forEach((game) => {
        const ra = game.reviews?.[a];
        const rb = game.reviews?.[b];
        if (ra != null && rb != null) {
            if (Math.abs(ra - rb) <= 0.5) agree += 1;
            n += 1;
        }
    });
    if (n < MIN_SHARED) return null;
    return { score: agree / n, shared: n, agree };
};

// Todos os pares de membros ordenados por afinidade (desc).
export const affinityPairs = (gameData) => {
    const names = allReviewers(gameData);
    const pairs = [];
    for (let i = 0; i < names.length; i += 1) {
        for (let j = i + 1; j < names.length; j += 1) {
            const res = affinity(gameData, names[i], names[j]);
            if (res) pairs.push({ a: names[i], b: names[j], ...res });
        }
    }
    pairs.sort((x, y) => y.score - x.score);
    return pairs;
};

// Membros mais parecidos com um dado membro (desc por afinidade).
export const mostSimilarTo = (gameData, name) => {
    const names = allReviewers(gameData).filter((n) => n !== name);
    return names
        .map((other) => ({ name: other, ...(affinity(gameData, name, other) || {}) }))
        .filter((x) => x.score != null)
        .sort((x, y) => y.score - x.score);
};

// Jogos que um membro ainda nao avaliou (titulos).
export const unratedByUser = (gameData, name) =>
    Object.entries(gameData)
        .filter(([, game]) => !(name in (game.reviews || {})))
        .map(([title]) => title);

// Quantos jogos faltam avaliar a cada membro (so membros que ja participaram).
export const missingCountByMember = (gameData) => {
    const total = Object.keys(gameData).length;
    const names = allReviewers(gameData);
    return names
        .map((name) => {
            const rated = Object.values(gameData).filter((g) => name in (g.reviews || {})).length;
            return { name, missing: total - rated, rated };
        })
        .sort((x, y) => x.missing - y.missing);
};

// Quantos jogos cada membro escolheu.
export const choicesByMember = (gameData, name) =>
    Object.entries(gameData).filter(([, game]) => chosenBy(game).includes(name));

export { average };
