import React, { useState } from 'react';
import './Game.css';
import './ratings.scss';
import GameCard from './GameCard';
import Modal from '../components/Modal';
import { posterSrc } from '../utils/images';
import { joinWithAmpersand } from '../utils/format';
import { average } from '../utils/ratings';

const Game = ({ title, year, link, date, chosenBy, genres, clips, reviews, comments }) => {
    const [showReviews, setShowReviews] = useState(false);

    const titleYear = `${title} (${year})`;
    const avg = average(reviews);
    const avgLabel = avg === null ? '-' : avg.toFixed(1);

    return (
        <div className='GameCard' onClick={() => setShowReviews(!showReviews)}>
            <div className='simple-poster'>
                <div className='title'>
                    <p>{titleYear}</p>
                </div>
                <div className='poster'>
                    <img src={posterSrc(title)} alt={`${title} poster`} loading="lazy" />
                    <div className="poster-overlay">
                        {avg !== null && <span className="poster-overlay-avg">{avgLabel} ★</span>}
                        {chosenBy && chosenBy.length > 0 && (
                            <span className="poster-overlay-chosen">escolha de {joinWithAmpersand(chosenBy)}</span>
                        )}
                    </div>
                </div>
            </div>
            {showReviews && (
                <Modal onClose={() => setShowReviews(false)}>
                    <GameCard
                        title={title}
                        year={year}
                        link={link}
                        date={date}
                        chosenBy={chosenBy}
                        genres={genres}
                        clips={clips}
                        reviews={reviews}
                        average={avg === null ? '-' : avg.toFixed(2)}
                        comments={comments}
                    />
                </Modal>
            )}
        </div>
    );
}

export default Game;
