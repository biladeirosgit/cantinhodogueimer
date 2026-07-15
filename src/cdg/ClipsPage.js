import React, { useState, useMemo } from "react";
import gameData from "./gameData.json";
// Esta pagina reusa o shell do sistema v2: `.stats-page`/`.kpi-grid` vem do
// Stats e `.filters`/`.title-site`/`.no-results` vem do catalogo.
import "./CantinhoDoGueimerStats.css";
import "./CantinhoDoGueimerPage.css";
import "./ClipsPage.css";
import Avatar from "../components/Avatar";
import { posterSrc } from "../utils/images";
import { compareDatesDesc } from "../utils/dates";
import { allClips } from "../utils/games";

// Chave estavel por clip. Um indice posicional sobre a lista filtrada faria o
// accordion abrir outro clip qualquer sempre que os filtros mudassem.
const clipKey = (clip) => `${clip.game}::${clip.link}`;

const ClipsPage = () => {
  const [openClip, setOpenClip] = useState(null);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedClipper, setSelectedClipper] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortCriteria, setSortCriteria] = useState("recent");

  const clips = useMemo(() => allClips(gameData), []);

  const uniqueGames = useMemo(() => [...new Set(clips.map((c) => c.game))].sort(), [clips]);
  const uniqueClippers = useMemo(() => [...new Set(clips.map((c) => c.cliped_by))].sort(), [clips]);

  const filteredClips = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return clips
      .filter((clip) => {
        const gameOk = !selectedGame || clip.game === selectedGame;
        const clipperOk = !selectedClipper || clip.cliped_by === selectedClipper;
        const titleOk = query ? clip.title.toLowerCase().includes(query) : true;
        return gameOk && clipperOk && titleOk;
      })
      // O `data` vem em DD/MM/YYYY: passar isso ao `new Date` da Invalid Date
      // (le o dia como mes) e o sort seria um no-op silencioso.
      .sort((a, b) =>
        sortCriteria === "recent"
          ? compareDatesDesc(a.data, b.data)
          : compareDatesDesc(b.data, a.data)
      );
  }, [clips, selectedGame, selectedClipper, searchTerm, sortCriteria]);

  return (
    <div className="stats-page">
      <div className="title-site">
        <h1>Clips do Gueimer</h1>
      </div>

      <div className="kpi-grid">
        <div className="kpi-tile">
          <span className="kpi-value">{clips.length}</span>
          <span className="kpi-label">Clips totais</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-value">{uniqueGames.length}</span>
          <span className="kpi-label">Jogos com clips</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-value">{uniqueClippers.length}</span>
          <span className="kpi-label">Clippers</span>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          className="filter-search"
          placeholder="Procurar clip…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
          <option value="">Todos os jogos</option>
          {uniqueGames.map((game) => (
            <option key={game} value={game}>{game}</option>
          ))}
        </select>
        <select value={selectedClipper} onChange={(e) => setSelectedClipper(e.target.value)}>
          <option value="">Todos os clippers</option>
          {uniqueClippers.map((clipper) => (
            <option key={clipper} value={clipper}>{clipper}</option>
          ))}
        </select>
        <select value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value)}>
          <option value="recent">Mais recentes</option>
          <option value="oldest">Mais antigos</option>
        </select>
      </div>

      {filteredClips.length === 0 && (
        <p className="no-results">Nenhum clip encontrado.</p>
      )}

      <ul className="clip-list">
        {filteredClips.map((clip) => {
          const key = clipKey(clip);
          const isOpen = openClip === key;
          return (
            <li key={key}>
              <button
                className="clip-row"
                aria-expanded={isOpen}
                onClick={() => setOpenClip(isOpen ? null : key)}
              >
                <img src={posterSrc(clip.game)} alt={`${clip.game} poster`} loading="lazy" />
                <div className="clip-row-info">
                  <h3 className="clip-title">{clip.title}</h3>
                  <div className="clip-row-meta">
                    <Avatar name={clip.cliped_by} size="sm" linkToUser={false} />
                    <span>{clip.cliped_by}</span>
                    <span className="clip-date">· {clip.data}</span>
                  </div>
                </div>
                <span className="clip-game-tag">{clip.game}</span>
                <span className="clip-chevron">▾</span>
              </button>

              {isOpen && (
                <div className="clip-embed">
                  <iframe
                    title={clip.title}
                    src={clip.link}
                    allow="autoplay"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ClipsPage;
