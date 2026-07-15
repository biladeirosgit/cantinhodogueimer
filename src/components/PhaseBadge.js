import React from 'react';
import './PhaseBadge.css';

// `phase` chega ja resolvido pelo phaseOf(): { slug, label } ou null.
//
// variant 'poster' -> etiqueta absoluta, encostada a esquerda do poster.
// variant 'inline' -> chip normal, no fluxo do texto (card expandido).
const PhaseBadge = ({ phase, variant = 'poster' }) => {
    if (!phase) return null;
    return (
        <span className={`phase-badge phase-badge--${variant} phase-badge--${phase.slug}`}>
            {phase.label}
        </span>
    );
};

export default PhaseBadge;
