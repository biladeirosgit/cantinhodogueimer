import React from 'react';
import { Link } from 'react-router-dom';
import './Game.css';
import './ratings.scss';
import { posterSrc, backdropSrc } from '../utils/images';
import { joinWithAmpersand } from '../utils/format';
import Avatar from '../components/Avatar';

const GameCard = ({ title, year, link, date, chosenBy, genres, clips, reviews, average, comments }) => {
    const reviewers = Object.keys(reviews || {});
    const nclips = (clips || []).length;
    const heroBg = `linear-gradient(90deg, rgba(13,10,20,0.96), rgba(13,10,20,0.45)), url("${backdropSrc(title)}")`;

    return (
        <div className="gc">
            <div className="gc-hero" style={{ backgroundImage: heroBg }}>
                <div className="gc-poster">
                    <img src={posterSrc(title)} alt={`${title} poster`} />
                </div>
                <div className="gc-hero-info">
                    <p className="gc-kicker">Jogo do clube</p>
                    <h2 className="gc-title">{title}</h2>
                    <p className="gc-meta">
                        {year}
                        {nclips > 0 && <> · {nclips} clips</>}
                        {average && average !== '-' && <> · média <b>{average}</b> ★</>}
                    </p>
                    <p className="gc-date">Escolhido dia {date}</p>
                    <a className="gc-link" href={link} target="_blank" rel="noopener noreferrer">Ver no Backloggd ↗</a>
                </div>
            </div>

            <div className="gc-body">
                <section>
                    <h3>Escolhido por</h3>
                    <p className="gc-chosen">{joinWithAmpersand(chosenBy) || '—'}</p>
                </section>

                {genres && genres.length > 0 && (
                    <section>
                        <h3>Tags</h3>
                        <div className="gc-tags">
                            {genres.map((genre) => <span key={genre}>{genre}</span>)}
                        </div>
                    </section>
                )}

                <section>
                    <h3>Ratings do clube</h3>
                    {reviewers.length ? (
                        <div className="gc-reviews">
                            {reviewers.map((user) => {
                                const userComments = comments && comments[user];
                                return (
                                    <div className="gc-review" key={user}>
                                        <div className="gc-review-head">
                                            <Link to={`/users/${user}`} className="gc-review-user">
                                                <Avatar name={user} size="sm" linkToUser={false} />
                                                <span>{user}</span>
                                            </Link>
                                            <ul className="rating-score gc-stars" data-rating={reviews[user]}>
                                                <li className="rating-score-item"></li>
                                                <li className="rating-score-item"></li>
                                                <li className="rating-score-item"></li>
                                                <li className="rating-score-item"></li>
                                                <li className="rating-score-item"></li>
                                            </ul>
                                        </div>
                                        {userComments && userComments.map((comment, i) => (
                                            <p className="gc-comment" key={i} dangerouslySetInnerHTML={{ __html: comment }}></p>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="gc-empty">Ainda sem ratings.</p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default GameCard;
