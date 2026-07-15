import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GameCard from './cdg/GameCard';
import gameData from './cdg/gameData.json';

const renderCard = (title) => {
    const game = gameData[title];
    return render(
        <MemoryRouter>
            <GameCard
                title={title}
                year={game.year}
                link={game.link}
                date={game.date}
                chosenBy={game['chosen by']}
                genres={game.genres}
                clips={game.clips}
                reviews={game.reviews}
                comments={game.comments}
            />
        </MemoryRouter>
    );
};

// Herdado do clone do clube de cinema, onde ha mesmo um jogo por semana. Aqui
// nao ha cadencia nenhuma: o gameData tem dois jogos a 12/06/2025 e intervalos
// de 1 a 5 dias. O `date` e o dia em que o jogo foi escolhido, e mais nada --
// dizer "Semana de 19/07 - 25/07" inventava um intervalo que nunca existiu.
test('mostra o dia da escolha, nao uma semana inventada', () => {
    const { container } = renderCard('PEAK');
    expect(screen.getByText('Escolhido dia 19/07/2025')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Semana/i);
    // o fim da "semana" era +6 dias: se voltasse, era este o texto
    expect(container.textContent).not.toMatch(/25\/07\/2025/);
});

test('a data sai tal e qual como esta no json', () => {
    renderCard('Overwatch 2');
    expect(screen.getByText(`Escolhido dia ${gameData['Overwatch 2'].date}`)).toBeInTheDocument();
});
