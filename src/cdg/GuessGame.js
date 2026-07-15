import React, { useState, useEffect } from 'react';
import gameData from './gameData.json';
import randomValues from './randomValues.json'; // Importe os valores aleatórios
import GameCard from './GameCard';
import './GuessGame.css';
import './Game.css';
import { posterSrc } from '../utils/images';
import { average } from '../utils/ratings';
import { chosenBy } from '../utils/games';

const STORAGE_KEY = 'guessGameStateCDG';

const GuessGame = () => {
    const [selectedGame, setSelectedGame] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [input, setInput] = useState('');
    const [filteredGames, setFilteredGames] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [dayOfYear, setDayOfYear] = useState(null);
    const maxGuesses = 20;

    useEffect(() => {
        const now = new Date();
        now.setHours(now.getHours() + 1);

        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const todayDayOfYear = Math.floor(diff / oneDay) + 1;

        setDayOfYear(todayDayOfYear);

        const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (savedState && savedState.dayOfYear === todayDayOfYear) {
            setGuesses(savedState.guesses || []);
            setGameOver(savedState.gameOver || false);
        }

        const timer = setInterval(() => {
            setTimeLeft(getTimeUntilMidnight());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const gameState = {
            guesses,
            gameOver,
            dayOfYear,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }, [guesses, gameOver, dayOfYear]);

    useEffect(() => {
        const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (savedState && savedState.dayOfYear !== dayOfYear) {
            setGuesses([]);
            setGameOver(false);
            localStorage.removeItem(STORAGE_KEY);
        }

        // Seleciona o jogo aleatório baseado no dia do ano
        const randomValue = randomValues[dayOfYear % randomValues.length];
        const gameTitles = Object.keys(gameData);
        const gameIndex = Math.floor(randomValue * gameTitles.length);
        const selectedTitle = gameTitles[gameIndex];
        setSelectedGame({ title: selectedTitle, ...gameData[selectedTitle] });
    }, [dayOfYear]);


    const getTimeUntilMidnight = () => {
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const timeDiff = midnight - now;
        const hours = Math.floor(timeDiff / 1000 / 60 / 60);
        const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
        const seconds = Math.floor((timeDiff / 1000) % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const handleGuess = () => {
        if (guesses.length >= maxGuesses || gameOver) return;

        if (input === selectedGame.title) {
            const feedback = getFeedback(input);
            setGuesses([...guesses, { guess: input, feedback }]);
            setGameOver(true);
        } else {
            if (input === "") { return; }
            if (!(input in gameData)) { return; }
            const feedback = getFeedback(input);
            setGuesses([...guesses, { guess: input, feedback }]);
            setInput('');
            setShowSuggestions(false);
        }
    };

    const getFeedback = (guessTitle) => {
        const guessedGame = gameData[guessTitle];
        if (!guessedGame) return null;

        const feedback = {};

        feedback.year = {
            color: getYearFeedback(guessedGame.year, selectedGame.year),
            value: guessedGame.year,
            actualValue: selectedGame.year,
            direction: guessedGame.year < selectedGame.year ? ' (cima)' : ' (baixo)'
        };
        feedback.genres = {
            color: getArrayFeedback(guessedGame.genres, selectedGame.genres),
            value: guessedGame.genres.join(', '),
            actualValue: selectedGame.genres.join(', ')
        };
        feedback.reviews = {
            color: getNumberFeedback(Object.keys(guessedGame.reviews).length, Object.keys(selectedGame.reviews).length),
            value: Object.keys(guessedGame.reviews).length,
            actualValue: Object.keys(selectedGame.reviews).length,
            direction: Object.keys(guessedGame.reviews).length < Object.keys(selectedGame.reviews).length ? ' (cima)' : ' (baixo)'
        };
        let guessedAverage = average(guessedGame.reviews).toFixed(2)
        let actualAverage = average(selectedGame.reviews).toFixed(2)

        feedback.average = {
            color: getAverageFeedback(guessedAverage, actualAverage),
            value: guessedAverage,
            actualValue: actualAverage,
            direction: guessedAverage < actualAverage ? ' (cima)' : ' (baixo)'
        };
        feedback.chosenBy = {
            color: getChoosenByFeedback(chosenBy(guessedGame), chosenBy(selectedGame)),
            value: getValueChoosenBy(chosenBy(guessedGame)),
            actualValue: chosenBy(selectedGame)
        };

        return feedback;
    };

    const getChoosenByFeedback = (guessValue, actualValue) => {
        const matchingElements = guessValue.filter(element => actualValue.includes(element));
        var ratio = 0;
        if (matchingElements.length !== 0) {
            ratio = matchingElements.length / actualValue.length;
        }
        if (ratio === 1 && actualValue.length === guessValue.length) return 'green';
        if (ratio > 0) return 'yellow';
        return 'red';
    };

    const getValueChoosenBy = (guessValue) => guessValue.join(' & ');

    const getAverageFeedback = (guessValue, actualValue) => {
        const diff = Math.abs(guessValue - actualValue);
        if (diff === 0) return 'green';
        if (diff <= 0.5) return 'yellow';
        return 'red';
    };

    const getYearFeedback = (guessValue, actualValue) => {
        const diff = Math.abs(guessValue - actualValue);
        if (diff === 0) return 'green';
        if (diff <= 5) return 'yellow';
        return 'red';
    };

    const getArrayFeedback = (guessArray, actualArray) => {
        const matchingElements = guessArray.filter(element => actualArray.includes(element));
        var ratio = 0;
        if (matchingElements.length !== 0) {
            ratio = matchingElements.length / actualArray.length;
        }
        if (ratio === 1 && actualArray.length === guessArray.length) return 'green';
        if (ratio > 0) return 'yellow';
        return 'red';
    };

    const getNumberFeedback = (guessNumber, actualNumber) => {
        const diff = Math.abs(guessNumber - actualNumber);
        if (diff === 0) return 'green';
        if (diff === 1) return 'yellow';
        return 'red';
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setInput(value);
        if (value) {
            const filtered = Object.keys(gameData)
                .filter(title =>
                    title.toLowerCase().includes(value.toLowerCase()) &&
                    !guesses.some(guessObj => guessObj.guess === title)
                );
            setFilteredGames(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredGames([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (gameTitle) => {
        setInput(gameTitle);
        setFilteredGames([]);
        setShowSuggestions(false);
    };

    return (
        <div className="container-guessgame">
            <p className="guess-kicker">Jogo diário</p>
            <h1>Adivinha o jogo do dia</h1>
            <p className="guess-sub">Dia {dayOfYear} · {maxGuesses - guesses.length} tentativas restantes</p>
            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={handleChange}
                    placeholder="Escreve um palpite…"
                    disabled={gameOver}
                />
                {showSuggestions && (
                    <div className="suggestions">
                        {filteredGames.map((gameTitle, index) => (
                            <div key={index} className="suggestion-item" onClick={() => handleSuggestionClick(gameTitle)}>
                                <img src={posterSrc(gameTitle)} alt={`${gameTitle} poster`} style={{ width: '36px', height: '54px' }} />
                                <span>{gameTitle}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="button">
                <button onClick={handleGuess} disabled={gameOver}>Adivinhar</button>
            </div>

            <div className="guess-table-wrap">
                <table className='pretty-table guess-game'>
                    <thead>
                        <tr>
                            <th>Jogo</th>
                            <th>Ano</th>
                            <th>Tags</th>
                            <th>Nº reviews</th>
                            <th>Média</th>
                            <th>Escolha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guesses.map((guessObj, index) => (
                            <tr key={index}>
                                <td>
                                    <div className="firstCol">
                                        <img src={posterSrc(guessObj.guess)} alt={`${guessObj.guess} poster`} style={{ width: '46px', height: '69px' }} />
                                        <span>{guessObj.guess}</span>
                                    </div>
                                </td>
                                <td className={`feedback ${guessObj.feedback.year.color}`}>
                                    {guessObj.feedback.year.value} {guessObj.feedback.year.color !== 'green' ? guessObj.feedback.year.direction : ''}
                                </td>
                                <td className={`feedback ${guessObj.feedback.genres.color}`}>
                                    {guessObj.feedback.genres.value}
                                </td>
                                <td className={`feedback ${guessObj.feedback.reviews.color}`}>
                                    {guessObj.feedback.reviews.value} {guessObj.feedback.reviews.color !== 'green' ? guessObj.feedback.reviews.direction : ''}
                                </td>
                                <td className={`feedback ${guessObj.feedback.average.color}`}>
                                    {guessObj.feedback.average.value} {guessObj.feedback.average.color !== 'green' ? guessObj.feedback.average.direction : ''}
                                </td>
                                <td className={`feedback ${guessObj.feedback.chosenBy.color}`}>
                                    {guessObj.feedback.chosenBy.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {gameOver && (
                <div className="guess-win">
                    <h2>Acertaste em <b>"{selectedGame.title}"</b> com {guesses.length} tentativas!</h2>
                    <p className="guess-next">Próximo jogo em {timeLeft}</p>
                    <div className="game-card">
                        <div className="modal-content">
                            <GameCard
                                title={selectedGame.title}
                                year={selectedGame.year}
                                link={selectedGame.link}
                                date={selectedGame.date}
                                chosenBy={chosenBy(selectedGame)}
                                genres={selectedGame.genres}
                                clips={selectedGame.clips}
                                reviews={selectedGame.reviews}
                                average={average(selectedGame.reviews).toFixed(2)}
                                comments={selectedGame.comments}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GuessGame;
