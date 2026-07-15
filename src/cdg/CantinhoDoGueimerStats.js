// src/cdg/CantinhoDoGueimerStats.js

import gameData from './gameData.json';
import React from 'react';
import './CantinhoDoGueimerStats.css';
import GameRow from '../components/GameRow';
import { Link } from 'react-router-dom';
import { compareDatesDesc } from '../utils/dates';
import Avatar from '../components/Avatar';
import { affinityPairs, missingCountByMember } from '../utils/stats';
import { chosenBy, allClips, isModeTag } from '../utils/games';

// Membro ativo: jogou pelo menos ACTIVE_MIN dos ultimos ACTIVE_WINDOW jogos.
// O clube de cinema usa 4 de 12; com 15 jogos essa janela daria "ativo" a toda
// a gente e nao distinguiria ninguem.
const ACTIVE_WINDOW = 6;
const ACTIVE_MIN = 3;

const CantinhoDoGueimerStats = () => {

    const findUniqueViewers = () => {
        const viewers = new Set();
        for (const [, game] of Object.entries(gameData)) {
            for (const viewer in game.reviews) {
                viewers.add(viewer);
            }
        }
        return viewers.size;
    };

    const calculateTotalViewers = () => {
        let totalViewers = 0;
        for (const [, game] of Object.entries(gameData)) {
            totalViewers += Object.keys(game.reviews).length;
        }
        return totalViewers;
    };

    const calculateClubAverage = () => {
        let total = 0;
        let n = 0;
        for (const [, game] of Object.entries(gameData)) {
            for (const rating of Object.values(game.reviews)) {
                total += rating;
                n += 1;
            }
        }
        return n === 0 ? 0 : total / n;
    };

    const calculateRatingStats = () => {
        const ratings = {};
        for (const [, game] of Object.entries(gameData)) {
            for (const reviewer in game.reviews) {
                const rating = game.reviews[reviewer];
                ratings[rating * 2] = (ratings[rating * 2] || 0) + 1;
            }
        }
        return ratings;
    };

    // Conta tags, separando generos de modos de jogo/perspetivas.
    const calculateTagStats = (wantModes) => {
        const tags = {};
        for (const [, game] of Object.entries(gameData)) {
            for (const tag of game.genres) {
                if (isModeTag(tag) !== wantModes) continue;
                tags[tag] = (tags[tag] || 0) + 1;
            }
        }
        return tags;
    };

    const calculateTotalGames = () => Object.entries(gameData).length;

    const calculateTopWatchers = () => {
        var watchers = {}
        var number_games = 0;

        var games = Object.entries(gameData).sort((a, b) => compareDatesDesc(a[1].date, b[1].date));

        for (const [, game] of games) {
            number_games += 1;
            for (const [user, rating] of Object.entries(game.reviews)) {
                if (user in watchers) {
                    watchers[user]["total_games"] += 1
                    watchers[user]["total_ratings"] += rating
                    if (number_games === watchers[user]["total_games"]) {
                        watchers[user]["streak"] += 1;
                    }
                    if (number_games <= ACTIVE_WINDOW) {
                        watchers[user]["active"] += 1;
                    }
                    if (watchers[user]["total_games"] === 1) {
                        watchers[user]["streak"] = -(number_games - 1);
                    }
                }
                else {
                    watchers[user] = {
                        "total_games": 1,
                        "total_ratings": rating,
                        "choices": 0,
                    }
                    if (number_games === 1) {
                        watchers[user]["streak"] = 1;
                    }
                    else {
                        watchers[user]["streak"] = -(number_games - 1);
                    }
                    watchers[user]["active"] = number_games <= ACTIVE_WINDOW ? 1 : 0;
                }
            }

            for (const name of chosenBy(game)) {
                if (name in watchers) {
                    watchers[name]["choices"] += 1
                }
                else {
                    watchers[name] = {
                        "total_games": 0,
                        "total_ratings": 0,
                        "choices": 1,
                        "streak": 0,
                        "active": 0,
                    }
                }
            }
        }
        return watchers
    }

    const calculateTopGames = () => {
        let games = Object.entries(gameData).map(([title, game]) => {
            var reviews = 0;
            var total_rating = 0;

            for (const [, rating] of Object.entries(game.reviews)) {
                reviews += 1;
                total_rating += rating;
            }

            return {
                title,
                reviews: reviews,
                average: (total_rating / reviews).toFixed(2)
            }
        })

        games.sort((a, b) => b.average - a.average);

        return games;
    }

    function getRankedViewers(data, clipsPerUser) {
        let entries = Object.entries(data);

        entries = entries.map(([name, info]) => ({
            name,
            total_games: info.total_games,
            total_ratings: info.total_ratings,
            choices: info.choices,
            streak: info.streak,
            active: info.active >= ACTIVE_MIN,
            active_count: info.active,
            clips: clipsPerUser[name] || 0,
            average_ratings: info.total_games ? (info.total_ratings / info.total_games).toFixed(2) : '-',
        }));

        entries.sort((a, b) => {
            if (b.total_games === a.total_games) {
                return a.name.localeCompare(b.name);
            }
            return b.total_games - a.total_games;
        });
        return entries;
    }

    // Os clips sao contados a parte dos `watchers`: um clipper pode nunca ter
    // avaliado nem escolhido nada e mesmo assim ter clips.
    const clips = allClips(gameData);
    const clipsPerUser = clips.reduce((acc, clip) => {
        acc[clip.cliped_by] = (acc[clip.cliped_by] || 0) + 1;
        return acc;
    }, {});
    const topClippers = Object.entries(clipsPerUser).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const watchers = calculateTopWatchers()
    const top = getRankedViewers(watchers, clipsPerUser)
    const active_members = top.filter((v) => v.active).length;

    const topGames = calculateTopGames()

    const top10 = topGames.slice(0, 10)
    const worst10 = topGames.slice().reverse().slice(0, 10)

    const topRanked = topGames.slice(0, 10);
    const topGenres = Object.entries(calculateTagStats(false)).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topModes = Object.entries(calculateTagStats(true)).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const ratingStats = calculateRatingStats();
    const maxRatingCount = Math.max(1, ...Object.values(ratingStats));
    const topPairs = affinityPairs(gameData).slice(0, 8);
    const missing = missingCountByMember(gameData).filter((m) => m.missing > 0).slice(0, 10);

    return (
        <div className="stats-page">
            <div className='title-site'>
                <h1>Estatísticas do Clube</h1>
            </div>
            <div className="kpi-grid">
                <div className="kpi-tile">
                    <span className="kpi-value">{calculateTotalGames()}</span>
                    <span className="kpi-label">Jogos jogados</span>
                </div>
                <div className="kpi-tile">
                    <span className="kpi-value">{calculateTotalViewers()}</span>
                    <span className="kpi-label">Ratings dados</span>
                </div>
                <div className="kpi-tile">
                    <span className="kpi-value">{clips.length}</span>
                    <span className="kpi-label">Clips</span>
                </div>
                <div className="kpi-tile">
                    <span className="kpi-value">{findUniqueViewers()}</span>
                    <span className="kpi-label">Membros</span>
                </div>
                <div className="kpi-tile">
                    <span className="kpi-value">{active_members}</span>
                    <span className="kpi-label">Membros ativos</span>
                </div>
                <div className="kpi-tile">
                    <span className="kpi-value">{calculateClubAverage().toFixed(2)}</span>
                    <span className="kpi-label">Média do clube</span>
                </div>
            </div>

            <div className="insight-grid">
                <div className="insight-card">
                    <h2>Top do clube</h2>
                    <ol className="ranking">
                        {topRanked.map((game) => (
                            <li key={game.title}>
                                <span>
                                    {game.title}
                                    <small>{game.reviews} ratings</small>
                                </span>
                                <strong>{game.average} ★</strong>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="insight-card">
                    <h2>Géneros mais jogados</h2>
                    <ol className="ranking">
                        {topGenres.map(([genre, count]) => (
                            <li key={genre}>
                                <span>{genre}</span>
                                <strong>{count}</strong>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="insight-card">
                    <h2>Como jogamos</h2>
                    <p className="insight-note">Modos e perspetivas, contados à parte dos géneros.</p>
                    <ol className="ranking">
                        {topModes.map(([mode, count]) => (
                            <li key={mode}>
                                <span>{mode}</span>
                                <strong>{count}</strong>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="insight-card">
                    <h2>Distribuição de ratings</h2>
                    <div className="rating-bars">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((key) => {
                            const count = ratingStats[key] || 0;
                            return (
                                <div className="rating-bar-row" key={key}>
                                    <span className="rating-bar-label">{(key / 2).toFixed(1)}★</span>
                                    <div className="rating-bar-track">
                                        <div className="rating-bar-fill" style={{ width: `${(count / maxRatingCount) * 100}%` }} />
                                    </div>
                                    <span className="rating-bar-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="insight-card">
                    <h2>Gostos mais parecidos</h2>
                    <p className="insight-note">Concordam quando dão notas a menos de meia estrela de distância.</p>
                    <ol className="ranking">
                        {topPairs.map((pair) => (
                            <li key={`${pair.a}-${pair.b}`}>
                                <span>
                                    {pair.a} &amp; {pair.b}
                                    <small>concordam em {pair.agree} de {pair.shared} jogos avaliados por ambos</small>
                                </span>
                                <strong>{Math.round(pair.score * 100)}%</strong>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="insight-card">
                    <h2>Top clippers</h2>
                    <ol className="ranking">
                        {topClippers.map(([name, count]) => (
                            <li key={name}>
                                <span><Link to={`/users/${name}`}>{name}</Link></span>
                                <strong>{count} clips</strong>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="insight-card">
                    <h2>Quem falta avaliar</h2>
                    <ol className="ranking">
                        {missing.map((m) => (
                            <li key={m.name}>
                                <span><Link to={`/users/${m.name}`}>{m.name}</Link></span>
                                <strong>{m.missing} por jogar</strong>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            <div className="top-bottom-games">
                <div className="best-worst">
                    <div className="best-worst-col">
                        <h2 className='section-title'>Melhores avaliados</h2>
                        <div className='game-row-grid game-row-grid--pair'>
                            {top10.map((game, i) => (
                                <GameRow key={game.title} title={game.title} game={gameData[game.title]} rank={i + 1} />
                            ))}
                        </div>
                    </div>
                    <div className="best-worst-col">
                        <h2 className='section-title'>Piores avaliados</h2>
                        <div className='game-row-grid game-row-grid--pair'>
                            {worst10.map((game, i) => (
                                <GameRow key={game.title} title={game.title} game={gameData[game.title]} rank={i + 1} />
                            ))}
                        </div>
                    </div>
                </div>

                <h2 className='section-title'>Ranking de membros</h2>
                <div className="table-scroll">
                    <table className='pretty-table compact-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Membro</th>
                                <th>Jogados</th>
                                <th>Média</th>
                                <th>Escolhas</th>
                                <th>Clips</th>
                                <th>Streak</th>
                                <th>Ativo*</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top.map((viewer, index) => (
                                <tr key={viewer.name}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <Link to={`/users/${viewer.name}`}>
                                            <div className='user'>
                                                <div className='top'>
                                                    <Avatar name={viewer.name} linkToUser={false} />
                                                </div>
                                                <div className='bottom'>
                                                    {viewer.name}
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td>{viewer.total_games}</td>
                                    <td>{viewer.average_ratings}</td>
                                    <td>{viewer.choices}</td>
                                    <td>{viewer.clips}</td>
                                    {viewer.streak > 0 && <td>{viewer.streak} 🔥</td>}
                                    {viewer.streak < 0 && <td>{-viewer.streak} ❄️</td>}
                                    {viewer.streak === 0 && <td>-</td>}
                                    <td>
                                        {viewer.active ? '✔️' : '❌'} ({viewer.active_count}/{ACTIVE_WINDOW})
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className='table-info'>
                    <p><b>*Membro ativo</b> — jogou pelo menos {ACTIVE_MIN} dos últimos {ACTIVE_WINDOW} jogos.</p>
                </div>

                <h2 className='section-title'>Todos os jogos</h2>
                <div className='game-row-grid game-row-grid--list'>
                    {topGames.map((game, index) => (
                        <GameRow key={game.title} title={game.title} game={gameData[game.title]} rank={index + 1} variant="list" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CantinhoDoGueimerStats;
