import React, { useState } from 'react';
import { Upload, CheckCircle2, Globe, Sparkles, Image as ImageIcon } from 'lucide-react';
import { PublishedGame, RobloxInstance } from '../types/roblox';
import { soundEngine } from '../engine/audio';
import confetti from 'canvas-confetti';

interface PublishModalProps {
  currentInstances: RobloxInstance[];
  lighting: {
    timeOfDay: number;
    ambientColor: string;
    fogDensity: number;
    skyType: 'clear' | 'sunset' | 'night' | 'cyberpunk';
  };
  onSavePublishedGame: (game: PublishedGame) => void;
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  currentInstances,
  lighting,
  onSavePublishedGame,
  onClose,
}) => {
  const [title, setTitle] = useState('Epic Obby & Sandbox 3D');
  const [description, setDescription] = useState(
    'A custom 3D game created using Roblox Studio Web. Test your parkour skills, collect coins, and reach the finish!'
  );
  const [creator, setCreator] = useState('nitinkumar14668');
  const [genre, setGenre] = useState<PublishedGame['genre']>('Obby');
  const [isPublished, setIsPublished] = useState(false);
  const [publishedGameData, setPublishedGameData] = useState<PublishedGame | null>(null);

  const handlePublish = () => {
    soundEngine.playCheckpoint();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored
    }

    const newGame: PublishedGame = {
      id: `game-${Date.now()}`,
      title,
      description,
      creator,
      genre,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      visits: 1,
      likes: 1,
      instances: JSON.parse(JSON.stringify(currentInstances)),
      lighting,
    };

    onSavePublishedGame(newGame);
    setPublishedGameData(newGame);
    setIsPublished(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#1c1c22] border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="h-12 px-5 bg-[#25252d] border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-sky-400" />
            <span className="font-bold text-sm text-white">Publish to Roblox</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {isPublished ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-white">Game Successfully Published!</h3>
            <p className="text-xs text-neutral-300 max-w-sm mx-auto">
              Your game <strong className="text-sky-400">"{publishedGameData?.title}"</strong> is now live in the Roblox Community Discover gallery!
            </p>

            <div className="p-3 bg-[#131317] rounded-lg border border-neutral-800 text-left text-xs font-mono space-y-1">
              <div><span className="text-neutral-500">Game ID:</span> {publishedGameData?.id}</div>
              <div><span className="text-neutral-500">Creator:</span> {publishedGameData?.creator}</div>
              <div><span className="text-neutral-500">Objects:</span> {publishedGameData?.instances.length} parts</div>
              <div><span className="text-neutral-500">Genre:</span> {publishedGameData?.genre}</div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#00a2ff] hover:bg-[#0091e6] text-white rounded-lg font-bold text-xs shadow-lg transition-all"
              >
                Back to Studio
              </button>
            </div>
          </div>
        ) : (
          /* Publish Form */
          <div className="p-6 space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Experience Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name your game..."
                className="w-full bg-[#121216] border border-neutral-700 rounded-lg p-2.5 text-neutral-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell players what your game is about..."
                className="w-full bg-[#121216] border border-neutral-700 rounded-lg p-2.5 text-neutral-100 focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Creator Name
                </label>
                <input
                  type="text"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  className="w-full bg-[#121216] border border-neutral-700 rounded-lg p-2.5 text-neutral-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Genre / Category
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as PublishedGame['genre'])}
                  className="w-full bg-[#121216] border border-neutral-700 rounded-lg p-2.5 text-neutral-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="Obby">Obby (Parkour)</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Sandbox">Sandbox / Build</option>
                  <option value="Tycoon">Tycoon</option>
                  <option value="Simulator">Simulator</option>
                  <option value="Racing">Racing</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Publishing will save your 3D world, parts, scripts, and lighting so anyone can play or continue building!
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePublish}
                className="px-5 py-2 rounded-lg bg-[#00a2ff] hover:bg-[#0091e6] text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Publish Experience</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
