import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CantinhoDoGueimerPage from './cdg/CantinhoDoGueimerPage';
import CantinhoDoGueimerStats from './cdg/CantinhoDoGueimerStats';
import UserStats from './cdg/UserStats';
import ClipsPage from './cdg/ClipsPage';
import GuessGame from './cdg/GuessGame';

const renderAt = (path, element, routePath) => {
    window.location.hash = path;
    return render(
        <HashRouter>
            <Routes><Route path={routePath || path} element={element} /></Routes>
        </HashRouter>
    );
};

test('catalogo: hero e o jogo mais recente e nao duplica na grelha', () => {
    const { container } = renderAt('/', <CantinhoDoGueimerPage />);
    expect(screen.getByText(/Jogo mais recente/i)).toBeInTheDocument();
    expect(screen.getByText(/^PEAK \(2025\)$/)).toBeInTheDocument();
    // 15 jogos - 1 no hero = 14 na grelha
    expect(container.querySelectorAll('.catalog-page .game')).toHaveLength(14);
});

test('stats: KPIs corretos e sem NaN', () => {
    const { container } = renderAt('/stats', <CantinhoDoGueimerStats />);
    const values = [...container.querySelectorAll('.kpi-value')].map((n) => n.textContent);
    expect(values).toEqual(['15', '81', '65', '8', '5', '3.78']);
    expect(container.textContent).not.toMatch(/NaN/);
});

test('stats: generos separados dos modos de jogo', () => {
    const { container } = renderAt('/stats', <CantinhoDoGueimerStats />);
    const cards = [...container.querySelectorAll('.insight-card')];
    const generos = cards.find((c) => c.querySelector('h2').textContent === 'Géneros mais jogados');
    const modos = cards.find((c) => c.querySelector('h2').textContent === 'Como jogamos');
    expect(within(generos).getAllByRole('listitem')[0].textContent).toMatch(/^Action12$/);
    expect(within(modos).getAllByRole('listitem')[0].textContent).toMatch(/^Multiplayer13$/);
});

test('stats: top clippers conta clips fora dos watchers', () => {
    const { container } = renderAt('/stats', <CantinhoDoGueimerStats />);
    const card = [...container.querySelectorAll('.insight-card')]
        .find((c) => c.querySelector('h2').textContent === 'Top clippers');
    const rows = within(card).getAllByRole('listitem').map((li) => li.textContent);
    expect(rows).toEqual(['Geremias58 clips', 'NeNelson6 clips', 'Xadas1 clips']);
});

test('stats: afinidade exclui pares com poucos jogos em comum', () => {
    const { container } = renderAt('/stats', <CantinhoDoGueimerStats />);
    const card = [...container.querySelectorAll('.insight-card')]
        .find((c) => c.querySelector('h2').textContent === 'Gostos mais parecidos');
    expect(within(card).getAllByRole('listitem').length).toBeGreaterThanOrEqual(8);
    expect(card.textContent).not.toMatch(/Xadas & Areias|Areias & Xadas/);
});

test('perfil rico: Geremias ja avaliou tudo', () => {
    renderAt('/users/Geremias', <UserStats />, '/users/:username');
    expect(screen.getByText(/Ainda por avaliar \(0\)/)).toBeInTheDocument();
    expect(screen.getByText(/Já avaliou tudo/)).toBeInTheDocument();
});

test('perfil limite: Areias nao crasha e cai nos fallbacks', () => {
    const { container } = renderAt('/users/Areias', <UserStats />, '/users/:username');
    expect(screen.getByText(/Ainda por avaliar \(12\)/)).toBeInTheDocument();
    expect(screen.getByText(/Ainda poucos jogos em comum/)).toBeInTheDocument();
    // "Escolhas dele" tambem e um KPI label, que renderiza sempre: o que nao
    // pode existir e a *seccao* com as escolhas.
    const titulos = [...container.querySelectorAll('.section-title')].map((n) => n.textContent);
    expect(titulos).not.toContain('Escolhas dele');
    expect(container.textContent).not.toMatch(/NaN/);
});

test('clips: KPIs e ordem decrescente por data', () => {
    const { container } = renderAt('/clips', <ClipsPage />);
    const values = [...container.querySelectorAll('.kpi-value')].map((n) => n.textContent);
    expect(values).toEqual(['65', '3', '3']);
    // Mais recente primeiro, mais antigo por ultimo: prova que o sort nao e um
    // no-op (com `new Date("30/05/2025")` seria Invalid Date e nada ordenava).
    const datas = [...container.querySelectorAll('.clip-date')].map((n) => n.textContent);
    expect(datas[0]).toBe('· 30/05/2025');
    expect(datas[datas.length - 1]).toBe('· 06/04/2025');
});

test('guess: 6 colunas, sem Min', () => {
    const { container } = renderAt('/guess', <GuessGame />);
    const ths = [...container.querySelectorAll('.guess-game th')].map((n) => n.textContent);
    expect(ths).toEqual(['Jogo', 'Ano', 'Tags', 'Nº reviews', 'Média', 'Escolha']);
});
