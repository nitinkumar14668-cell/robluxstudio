import React, { useState } from 'react';
import { Play, Edit3, Globe, ThumbsUp, Users, Download, Upload, Plus, Layers, Flame, Star } from 'lucide-react';
import { PublishedGame } from '../types/roblox';
import { soundEngine } from '../engine/audio';

interface GamesGalleryProps {
  games: PublishedGame[];
  onPlayGame: (game: PublishedGame) => void;
  onEditGame: (game: PublishedGame) => void;
  onNewFromTemplate: (templateName: 'baseplate' | 'obby' | 'lava') => void;
  onImportGameFile: (file: File) => void;
  onClose: () => void;
}

export const GamesGallery: React.FC<GamesGalleryProps> = ({
  games,
  onPlayGame,
  onEditGame,
  onNewFromTemplate,
  onImportGameFile,
  onClose,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [search, setSearch] = useState('');

  const genres = ['All', 'Obby', 'Adventure', 'Sandbox', 'Racing'];

  const filteredGames = games.filter((g) => {
    const matchesGenre = selectedGenre === 'All' || g.genre === selectedGenre;
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.creator.toLowerCase().includes(search.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const getGenreColor = (genre: string) => {
    switch (genre) {
      case 'Obby':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Adventure':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Sandbox':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121216]/95 backdrop-blur-md flex flex-col text-neutral-200 overflow-hidden">
      {/* Top Navigation */}
      <div className="h-14 px-6 bg-[#1a1a20] border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00a2ff] rounded-lg flex items-center justify-center transform -rotate-12 shadow">
            <div className="w-3.5 h-3.5 bg-white rounded-xs transform rotate-12" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white tracking-tight">
              Roblox Discover & Published Games
            </h2>
            <p className="text-[11px] text-neutral-400">
              Play community creations or load them into Studio to customize
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Import JSON .rbxl button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold cursor-pointer border border-neutral-700 text-neutral-300">
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Import .rbxl</span>
            <input
              type="file"
              accept=".json,.rbxl"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  onImportGameFile(e.target.files[0]);
                }
              }}
            />
          </label>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-lg border border-neutral-700"
          >
            Back to Studio
          </button>
        </div>
      </div>

      {/* Templates Quick Bar */}
      <div className="px-6 py-3 bg-[#17171d] border-b border-neutral-800 flex items-center gap-4 text-xs overflow-x-auto">
        <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">
          Create New:
        </span>
        <button
          onClick={() => {
            soundEngine.playClick();
            onNewFromTemplate('baseplate');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-200 border border-neutral-700 font-semibold shrink-0"
        >
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Classic Baseplate</span>
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            onNewFromTemplate('obby');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-200 border border-neutral-700 font-semibold shrink-0"
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Super Obby Parkour</span>
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            onNewFromTemplate('lava');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-200 border border-neutral-700 font-semibold shrink-0"
        >
          <Flame className="w-3.5 h-3.5 text-red-500" />
          <span>Lava Escape Arena</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Genre pills */}
        <div className="flex items-center gap-2">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedGenre === g
                  ? 'bg-[#00a2ff] text-white shadow'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search games or creators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 bg-[#18181f] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 placeholder-neutral-500"
        />
      </div>

      {/* Games Cards Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="bg-[#1c1c24] border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden flex flex-col shadow-lg transition-all hover:-translate-y-0.5"
          >
            {/* Thumbnail Banner */}
            <div className="h-36 bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-4 relative flex flex-col justify-between border-b border-neutral-800/80">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getGenreColor(
                    game.genre
                  )}`}
                >
                  {game.genre}
                </span>
                <span className="text-[10px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded font-mono text-neutral-400">
                  {game.instances.length} Parts
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight drop-shadow truncate">
                  {game.title}
                </h3>
                <p className="text-[11px] text-neutral-300">by {game.creator}</p>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                {game.description}
              </p>

              <div>
                {/* Stats */}
                <div className="flex items-center gap-4 text-[11px] text-neutral-500 font-mono mb-4 border-t border-neutral-800/80 pt-2.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    {game.visits.toLocaleString()} Visits
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                    {game.likes.toLocaleString()}
                  </span>
                </div>

                {/* Action Buttons: Play vs Edit in Studio */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onPlayGame(game);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onEditGame(game);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-sky-400 font-bold text-xs rounded-lg border border-neutral-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Studio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
