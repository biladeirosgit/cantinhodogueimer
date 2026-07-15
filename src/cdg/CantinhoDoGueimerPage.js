import React, { useState, useMemo } from 'react';
import Game from './Game';
import GameCard from './GameCard';
import Modal from '../components/Modal';
import gameData from './gameData.json';
import './CantinhoDoGueimerPage.css';
import { average } from '../utils/ratings';
import { compareDatesDesc } from '../utils/dates';
import { backdropSrc, posterSrc } from '../utils/images';
import { joinWithAmpersand } from '../utils/format';
import { chosenBy } from '../utils/games';

// Helper functions
const getUniqueValues = (data, key) => {
    const values = new Set();
    Object.values(data).forEach(game => {
        if (Array.isArray(game[key])) {
            game[key].forEach(item => values.add(item));
        } else {
            values.add(game[key]);
        }
    });
    return Array.from(values).sort();
};

const getYearRange = (data) => {
    const years = Object.values(data).map(game => game.year);
    return [Math.min(...years), Math.max(...years)];
};

const CantinhoDoGueimerPage = () => {
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedChosenBy, setSelectedChosenBy] = useState('');
    const [sortCriteria, setSortCriteria] = useState('date');
    const [search, setSearch] = useState('');
    const [heroExpanded, setHeroExpanded] = useState(false);

    // Calcular ano mínimo e máximo dos jogos
    const [minYear, maxYear] = useMemo(() => getYearRange(gameData), []);
    const [yearRange, setYearRange] = useState([minYear, maxYear]);

    const genres = useMemo(() => getUniqueValues(gameData, 'genres'), []);
    const chosenByPeople = useMemo(() => getUniqueValues(gameData, 'chosen by'), []);

    const [heroTitle, heroGame] = useMemo(() => {
        const entries = Object.entries(gameData).sort(([, a], [, b]) => compareDatesDesc(a.date, b.date));
        return entries[0] || [null, null];
    }, []);
    const heroAverage = useMemo(() => (heroGame ? average(heroGame.reviews) : null), [heroGame]);

    const compareRatings = (game1, game2) => {
        const avg1 = average(game1.reviews) || 0;
        const avg2 = average(game2.reviews) || 0;
        return avg2 - avg1;
    };

    const filteredGames = useMemo(() => {
        const query = search.trim().toLowerCase();
        return Object.entries(gameData)
            .filter(([title, game]) => {
                if (title === heroTitle) return false; // ja aparece em destaque no hero
                const matchesSearch = query ? title.toLowerCase().includes(query) : true;
                const matchesGenre = selectedGenre ? game.genres.includes(selectedGenre) : true;
                const matchesChosenBy = selectedChosenBy ? chosenBy(game).includes(selectedChosenBy) : true;
                const matchesYear = game.year >= yearRange[0] && game.year <= yearRange[1];
                return matchesSearch && matchesGenre && matchesChosenBy && matchesYear;
            })
            .sort(([, game1], [, game2]) => {
                if (sortCriteria === 'date') return compareDatesDesc(game1.date, game2.date);
                if (sortCriteria === 'rating') return compareRatings(game1, game2);
                if (sortCriteria === 'year') return game2.year - game1.year;
                return 0;
            });
    }, [search, selectedGenre, selectedChosenBy, yearRange, sortCriteria, heroTitle]);

    return (
        <div className="catalog-root">
            {heroGame && (
                <div
                    className="hero-game"
                    style={{ backgroundImage: `url("${backdropSrc(heroTitle)}")` }}
                    onClick={() => setHeroExpanded(true)}
                >
                    <div className="hero-game-content">
                        <div className="hero-game-poster">
                            <img src={posterSrc(heroTitle)} alt={`${heroTitle} poster`} />
                        </div>
                        <div className="hero-game-info">
                            <div className="hero-game-eyebrow">Jogo mais recente</div>
                            <h2 className="hero-game-title">{heroTitle} ({heroGame.year})</h2>
                            <div className="hero-game-meta">
                                Escolhido por <b>{joinWithAmpersand(chosenBy(heroGame)) || '—'}</b>
                                {heroAverage !== null && <> · média <b>{heroAverage.toFixed(2)}</b>/5</>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {heroExpanded && (
                <Modal onClose={() => setHeroExpanded(false)}>
                    <GameCard
                        title={heroTitle}
                        year={heroGame.year}
                        link={heroGame.link}
                        date={heroGame.date}
                        chosenBy={chosenBy(heroGame)}
                        genres={heroGame.genres}
                        clips={heroGame.clips}
                        reviews={heroGame.reviews}
                        average={heroAverage === null ? '-' : heroAverage.toFixed(2)}
                        comments={heroGame.comments}
                    />
                </Modal>
            )}

            {/* Filtros */}
            <div className="filters">
                <input
                    type="text"
                    className="filter-search"
                    placeholder="Procurar jogo…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                    <option value="">Todas as tags</option>
                    {genres.map((genre, index) => (
                        <option key={index} value={genre}>{genre}</option>
                    ))}
                </select>
                <select value={selectedChosenBy} onChange={(e) => setSelectedChosenBy(e.target.value)}>
                    <option value="">Todas as escolhas</option>
                    {chosenByPeople.map((person, index) => (
                        <option key={index} value={person}>{person}</option>
                    ))}
                </select>
                <select value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value)}>
                    <option value="date">Mais recentes</option>
                    <option value="rating">Melhor rating</option>
                    <option value="year">Ano</option>
                </select>
                <div className="filter-year">
                    <span className="filter-year-label">Ano {yearRange[0]}–{yearRange[1]}</span>
                    <div className="filter-year-sliders">
                        <input
                            type="range"
                            min={minYear}
                            max={maxYear}
                            value={yearRange[0]}
                            onChange={(e) => {
                                const newMin = Number(e.target.value);
                                if (newMin <= yearRange[1]) setYearRange([newMin, yearRange[1]]);
                            }}
                        />
                        <input
                            type="range"
                            min={minYear}
                            max={maxYear}
                            value={yearRange[1]}
                            onChange={(e) => {
                                const newMax = Number(e.target.value);
                                if (newMax >= yearRange[0]) setYearRange([yearRange[0], newMax]);
                            }}
                        />
                    </div>
                </div>
            </div>

            {filteredGames.length === 0 && (
                <p className="no-results">Nenhum jogo encontrado.</p>
            )}

            {/* Catálogo de jogos */}
            <div className='catalog-page'>
                {filteredGames.map(([title, game], index) => (
                    <div className='game' key={title} style={{ animationDelay: `${Math.min(index, 20) * 0.03}s` }}>
                        <Game
                            title={title}
                            year={game.year}
                            link={game.link}
                            date={game.date}
                            chosenBy={chosenBy(game)}
                            genres={game.genres}
                            clips={game.clips}
                            reviews={game.reviews}
                            comments={game.comments}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CantinhoDoGueimerPage;
