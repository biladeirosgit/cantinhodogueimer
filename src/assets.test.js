import fs from 'fs';
import path from 'path';
import gameData from './cdg/gameData.json';
import { chosenBy } from './utils/games';

// O nome do ficheiro nao e o titulo: o images.js tira-lhe a pontuacao
// ("R.E.P.O" -> "REPO.png"). Quem acrescenta um jogo a mao nao tem como
// adivinhar isso, e o erro e silencioso -- a imagem simplesmente nao aparece,
// porque o dev server responde index.html a qualquer 404. Daqui em diante da
// erro aqui, que e onde se ve.
const clean = (title) => title.replace(/[^\w\s]/gi, '');
const PUBLIC = path.join(__dirname, '..', 'public');
const existe = (p) => fs.existsSync(path.join(PUBLIC, p));

const titulos = Object.keys(gameData);

describe('imagens dos jogos', () => {
    test.each(titulos)('%s tem poster com o nome que o codigo procura', (titulo) => {
        expect(existe(`posters/${clean(titulo)}.png`)).toBe(true);
    });

    test.each(titulos)('%s tem backdrop com o nome que o codigo procura', (titulo) => {
        expect(existe(`backgrounds/${clean(titulo)}.png`)).toBe(true);
    });

    // O contrario tambem interessa: um ficheiro a mais quer dizer que alguem
    // lhe deixou a pontuacao no nome, ou que o jogo saiu do JSON.
    test('nao ha imagens orfas em posters/ nem em backgrounds/', () => {
        const esperados = new Set(titulos.map((t) => `${clean(t)}.png`));
        for (const pasta of ['posters', 'backgrounds']) {
            const orfas = fs
                .readdirSync(path.join(PUBLIC, pasta))
                .filter((f) => f.endsWith('.png') && !esperados.has(f))
                .map((f) => `${pasta}/${f}`);
            expect(orfas).toEqual([]);
        }
    });
});

describe('avatares', () => {
    // As pfp seguem outra regra: e o nome tal e qual, sem clean().
    test('toda a gente que escolheu um jogo tem pfp', () => {
        const pessoas = new Set(Object.values(gameData).flatMap((g) => chosenBy(g)));
        const semPfp = [...pessoas].filter((p) => !existe(`pfp/${p}.png`));
        expect(semPfp).toEqual([]);
    });
});
