import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const LINKS = [
    { to: '/', label: 'Catálogo' },
    { to: '/stats', label: 'Stats' },
    { to: '/guess', label: 'Guess' },
    { to: '/clips', label: 'Clips' },
];

const NavBar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <span className="brand-long">Cantinho do </span>
                <span className="brand-accent">Gueimer</span>
            </Link>
            <div className="navbar-links">
                {LINKS.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`navbar-link${location.pathname === link.to ? ' active' : ''}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default NavBar;
