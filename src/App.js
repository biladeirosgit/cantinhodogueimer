// src/App.js

import React from 'react';
import { Routes, Route, HashRouter } from "react-router-dom";
import NavBar from './components/NavBar';
import CantinhoDoGueimerPage from './cdg/CantinhoDoGueimerPage';
import CantinhoDoGueimerStats from './cdg/CantinhoDoGueimerStats';
import UserStats from './cdg/UserStats';
import GuessGame from './cdg/GuessGame';
import ClipsPage from './cdg/ClipsPage';

const App = () => {
    return (
        <HashRouter>
            <NavBar />
            <Routes>
                <Route path="/" element={<CantinhoDoGueimerPage/>} />
                <Route path="/stats" element={<CantinhoDoGueimerStats/>} />
                <Route path="/users/:username" element={<UserStats/>} />
                <Route path="/guess" element={<GuessGame/>} />
                <Route path="/clips" element={<ClipsPage/>} />
            </Routes>
        </HashRouter>
    );
}

export default App;
