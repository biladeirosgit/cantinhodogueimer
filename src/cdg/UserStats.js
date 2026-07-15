import React from 'react';
import { useParams, Link } from 'react-router-dom';
import gameData from './gameData.json';
import './CantinhoDoGueimerStats.css';
import GameRow from '../components/GameRow';
import { mostSimilarTo, unratedByUser } from '../utils/stats';
import { chosenBy, allClips } from '../utils/games';

const UserStats = () => {
    const { username } = useParams();

    let totalGamesPlayed = 0;
    let totalRatings = 0;
    for (const title in gameData) {
        const reviews = gameData[title].reviews || {};
        if (username in reviews) {
            totalGamesPlayed++;
            totalRatings += reviews[username];
        }
    }
    const averageRating = totalRatings / totalGamesPlayed;

    const totalClips = allClips(gameData).filter((clip) => clip.cliped_by === username).length;

    // Jogos avaliados por este membro, ordenados pela nota que ele deu (desc).
    const played = Object.entries(gameData)
        .filter(([, game]) => username in (game.reviews || {}))
        .map(([title, game]) => ({ title, game, rating: game.reviews[username] }))
        .sort((a, b) => b.rating - a.rating);

    // Jogos que ele escolheu.
    const recommendations = Object.entries(gameData)
        .filter(([, game]) => chosenBy(game).includes(username))
        .map(([title, game]) => ({ title, game, rating: game.reviews?.[username] }));

    const similar = mostSimilarTo(gameData, username).slice(0, 6);
    const unrated = unratedByUser(gameData, username);

    return (
        <div className="stats-page">
            <div className='title-site'>
                <h1>Perfil de {username}</h1>
            </div>
            <div className="kpi-grid">
                <div className="kpi-tile">
                    <span className="kpi-value">{totalGamesPlayed}</span>
                    <span className="kpi-label">Jogos jogados</span>
                </div>
                <div className="kpi-tile">
                    <span className="kpi-value">{isNaN(averageRating) ? '-' : averageRating.toFixed(2)}</span>
                    <span className="kpi-label">Média que dá</span>
                </div>
                <div className="kpi-tile">
                    <span className="kpi-value">{totalClips}</span>
                    <span className="kpi-label">Clips dele</span>
                </div>
                <div className="kpi-tile">
                    <span className="kpi-value">{recommendations.length}</span>
                    <span className="kpi-label">Escolhas dele</span>
                </div>
            </div>

            <div className="insight-grid">
                <div className="insight-card">
                    <h2>Gostos mais parecidos</h2>
                    <p className="insight-note">% de jogos avaliados por ambos em que dão nota a menos de meia estrela de distância.</p>
                    {similar.length ? (
                        <ol className="ranking">
                            {similar.map((s) => (
                                <li key={s.name}>
                                    <span><Link to={`/users/${s.name}`}>{s.name}</Link><small>concordam em {s.agree} de {s.shared} jogos</small></span>
                                    <strong>{Math.round(s.score * 100)}%</strong>
                                </li>
                            ))}
                        </ol>
                    ) : <p className="highlight-sub">Ainda poucos jogos em comum para comparar.</p>}
                </div>
                <div className="insight-card">
                    <h2>Ainda por avaliar ({unrated.length})</h2>
                    {unrated.length ? (
                        <ol className="ranking">
                            {unrated.slice(0, 8).map((title) => (
                                <li key={title}><span>{title}</span></li>
                            ))}
                        </ol>
                    ) : <p className="highlight-sub">Já avaliou tudo. Lenda. 🏆</p>}
                </div>
            </div>

            <div className="top-bottom-games">
                {recommendations.length > 0 && (
                    <>
                        <h2 className='section-title'>Escolhas dele</h2>
                        <div className="game-row-grid">
                            {recommendations.map((r) => (
                                <GameRow key={r.title} title={r.title} game={r.game} userRating={r.rating} userLabel={username} />
                            ))}
                        </div>
                    </>
                )}

                <h2 className='section-title'>Jogos avaliados</h2>
                <div className="game-row-grid">
                    {played.map((g) => (
                        <GameRow key={g.title} title={g.title} game={g.game} userRating={g.rating} userLabel={username} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UserStats;
