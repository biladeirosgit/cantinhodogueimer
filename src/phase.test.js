import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CantinhoDoGueimerPage from './cdg/CantinhoDoGueimerPage';
import GameCard from './cdg/GameCard';
import { phaseOf } from './utils/games';
import gameData from './cdg/gameData.json';

const renderCatalogo = () => {
    window.location.hash = '/';
    return render(
        <HashRouter>
            <Routes><Route path="/" element={<CantinhoDoGueimerPage />} /></Routes>
        </HashRouter>
    );
};

// Encontra o cartao do catalogo pelo titulo que ele mostra.
const cartao = (container, titulo) =>
    [...container.querySelectorAll('.GameCard')]
        .find((n) => n.querySelector('.title p').textContent.startsWith(titulo));

describe('phaseOf', () => {
    test('resolve as chaves do JSON para o label mostrado', () => {
        expect(phaseOf({ phase: 'beta' })).toEqual({ slug: 'beta', label: 'Beta' });
        expect(phaseOf({ phase: 'early-access' })).toEqual({
            slug: 'early-access',
            label: 'Acesso Antecipado',
        });
        expect(phaseOf({ phase: 'demo' })).toEqual({ slug: 'demo', label: 'Demo' });
    });

    // O caso normal: a esmagadora maioria dos jogos nao tem fase.
    test('devolve null quando nao ha fase', () => {
        expect(phaseOf({})).toBeNull();
        expect(phaseOf(undefined)).toBeNull();
    });

    // Um typo no JSON manual nao pode rebentar o catalogo inteiro: vale mais
    // nao aparecer etiqueta nenhuma do que um ecra branco.
    test('uma chave desconhecida da null em vez de crashar', () => {
        expect(phaseOf({ phase: 'acesso antecipado' })).toBeNull();
        expect(phaseOf({ phase: 'BETA' })).toBeNull();
        // `toString` existe em qualquer objeto: o lookup nao pode apanhar o
        // prototipo e devolver uma funcao como se fosse uma fase.
        expect(phaseOf({ phase: 'toString' })).toBeNull();
    });
});

describe('os dados', () => {
    test('so o League of Legends e o R.E.P.O tem fase', () => {
        const comFase = Object.entries(gameData)
            .filter(([, g]) => g.phase)
            .map(([t, g]) => [t, g.phase]);
        expect(comFase).toEqual([
            ['League of Legends', 'beta'],
            ['R.E.P.O', 'early-access'],
        ]);
    });

    // Se alguem escrever "early access" sem traco, o phaseOf devolve null e a
    // etiqueta desaparece em silencio. Este teste e que da o berro.
    test('todas as fases do JSON sao chaves que o phaseOf conhece', () => {
        const desconhecidas = Object.entries(gameData)
            .filter(([, g]) => g.phase && phaseOf(g) === null)
            .map(([titulo, g]) => `${titulo}: "${g.phase}"`);
        expect(desconhecidas).toEqual([]);
    });
});

describe('etiqueta no poster do catalogo', () => {
    test('o League of Legends mostra Beta e o R.E.P.O mostra Acesso Antecipado', () => {
        const { container } = renderCatalogo();
        expect(within(cartao(container, 'League of Legends')).getByText('Beta')).toHaveClass(
            'phase-badge--beta'
        );
        expect(within(cartao(container, 'R.E.P.O')).getByText('Acesso Antecipado')).toHaveClass(
            'phase-badge--early-access'
        );
    });

    // A etiqueta esta dentro do .poster (que e position:relative) e nao do
    // cartao: fora dali, o `position:absolute` ancorava noutro sitio qualquer.
    test('vive dentro do .poster, que e quem a ancora', () => {
        const { container } = renderCatalogo();
        const badge = within(cartao(container, 'League of Legends')).getByText('Beta');
        expect(badge.closest('.poster')).not.toBeNull();
    });

    test('os jogos sem fase nao tem etiqueta nenhuma', () => {
        const { container } = renderCatalogo();
        const semFase = Object.keys(gameData).filter((t) => !gameData[t].phase);
        // e a maioria: se este numero cair para 0, o teste deixou de provar algo
        expect(semFase.length).toBeGreaterThan(10);
        for (const titulo of semFase) {
            const c = cartao(container, titulo);
            if (!c) continue; // o mais recente esta no hero, nao na grelha
            expect(c.querySelector('.phase-badge')).toBeNull();
        }
    });

    test('so ha duas etiquetas no catalogo todo', () => {
        const { container } = renderCatalogo();
        expect(container.querySelectorAll('.phase-badge')).toHaveLength(2);
    });
});

describe('etiqueta no card expandido', () => {
    const renderCard = (titulo) => {
        const game = gameData[titulo];
        return render(
            <HashRouter>
                <GameCard
                    title={titulo}
                    year={game.year}
                    link={game.link}
                    date={game.date}
                    chosenBy={game['chosen by']}
                    genres={game.genres}
                    clips={game.clips}
                    reviews={game.reviews}
                    comments={game.comments}
                    phase={phaseOf(game)}
                />
            </HashRouter>
        );
    };

    test('e um chip ao lado do "Jogo do clube"', () => {
        const { container } = renderCard('League of Legends');
        const kicker = container.querySelector('.gc-kicker');
        expect(kicker.textContent).toBe('Jogo do clubeBeta');
        expect(within(kicker).getByText('Beta')).toHaveClass('phase-badge--inline');
    });

    // Mostrar a mesma coisa no poster e no kicker do mesmo card era repetir a
    // informacao na mesma vista.
    test('nao repete a etiqueta no poster do card', () => {
        const { container } = renderCard('League of Legends');
        expect(container.querySelector('.gc-poster .phase-badge')).toBeNull();
        expect(container.querySelectorAll('.phase-badge')).toHaveLength(1);
    });

    test('um jogo sem fase nao mostra chip nenhum', () => {
        const { container } = renderCard('PEAK');
        expect(container.querySelector('.phase-badge')).toBeNull();
        expect(container.querySelector('.gc-kicker').textContent).toBe('Jogo do clube');
    });
});

// O CSS e onde este pedido vive: "em cima" e "colado a esquerda" nao se veem
// em jsdom, que nao faz layout. Le-se a folha.
describe('posicao da etiqueta (CSS)', () => {
    const css = require('fs').readFileSync(
        require('path').join(__dirname, 'components/PhaseBadge.css'),
        'utf8'
    );
    const regraPoster = css.match(/\.phase-badge--poster\s*\{([^}]*)\}/)[1];

    // Estava em baixo e tapava a nota e o "escolha de X" que o .poster-overlay
    // empilha la (justify-content: flex-end). Subiu para o topo por isso.
    test('esta ancorada em cima e nao em baixo', () => {
        expect(regraPoster).toMatch(/top:\s*\d+px/);
        expect(regraPoster).not.toMatch(/bottom:\s*\d/);
    });

    test('o overlay do hover continua a empilhar em baixo', () => {
        // Se isto mudar para flex-start, a etiqueta em cima volta a colidir.
        const gameCss = require('fs').readFileSync(
            require('path').join(__dirname, 'cdg/Game.css'),
            'utf8'
        );
        const overlay = gameCss.match(/\.poster-overlay\s*\{([^}]*)\}/)[1];
        expect(overlay).toMatch(/justify-content:\s*flex-end/);
    });

    test('encostada a esquerda e solta a direita', () => {
        expect(regraPoster).toMatch(/left:\s*0/);
        expect(regraPoster).not.toMatch(/right:\s*\d/);
    });

    // Sem isto sumia por baixo do gradiente do hover.
    test('fica acima do overlay do hover', () => {
        expect(regraPoster).toMatch(/z-index:\s*2/);
    });

    test('as 3 fases tem cores distintas, e vindas de tokens', () => {
        const tokens = require('fs').readFileSync(
            require('path').join(__dirname, 'styles/tokens.css'),
            'utf8'
        );
        const hexes = ['beta', 'early-access', 'demo'].map((slug) => {
            const regra = css.match(new RegExp(`\\.phase-badge--${slug}\\s*\\{([^}]*)\\}`))[1];
            const ref = regra.match(/background:\s*var\((--[\w-]+)\)/)[1];
            return tokens.match(new RegExp(`${ref}:\\s*(#[0-9a-fA-F]{6})`))[1].toLowerCase();
        });
        expect(new Set(hexes).size).toBe(3);
    });
});
