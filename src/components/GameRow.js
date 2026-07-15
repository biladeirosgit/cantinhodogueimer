import React, { useState } from 'react';
import GameCard from '../cdg/GameCard';
import Modal from './Modal';
import { posterSrc } from '../utils/images';
import { average } from '../utils/ratings';
import { chosenBy, phaseOf } from '../utils/games';
import './GameRow.css';

// Cartao horizontal clicavel: poster + titulo + notas. Abre o card no clique.
// variant: 'card' (default) ou 'list' (mais compacto, com rank).
const GameRow = ({ title, game, rank, userRating, userLabel = 'rating', showClubAverage = true, variant = 'card' }) => {
    const [open, setOpen] = useState(false);
    const clubAvg = average(game.reviews);
    const clubAvgLabel = clubAvg === null ? '-' : clubAvg.toFixed(2);

    return (
        <>
            <button className={`game-row game-row--${variant}`} onClick={() => setOpen(true)}>
                {rank != null && <span className="game-row-rank">{rank}</span>}
                <img src={posterSrc(title)} alt={`${title} poster`} loading="lazy" />
                <div className="game-row-info">
                    <h3>{title} <span className="game-row-year">({game.year})</span></h3>
                    <div className="game-row-ratings">
                        {userRating != null && (
                            <span className="game-row-user">{Number(userRating).toFixed(1)} ★ <span className="game-row-note">{userLabel}</span></span>
                        )}
                        {showClubAverage && (
                            <span className="game-row-club">{clubAvgLabel} ★ <span className="game-row-note">média do clube</span></span>
                        )}
                    </div>
                </div>
            </button>
            {open && (
                <Modal onClose={() => setOpen(false)}>
                    <GameCard
                        title={title}
                        year={game.year}
                        link={game.link}
                        date={game.date}
                        chosenBy={chosenBy(game)}
                        genres={game.genres}
                        clips={game.clips}
                        reviews={game.reviews}
                        average={clubAvgLabel}
                        comments={game.comments}
                        phase={phaseOf(game)}
                    />
                </Modal>
            )}
        </>
    );
};

export default GameRow;
