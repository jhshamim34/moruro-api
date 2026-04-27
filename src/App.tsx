import React, { useState } from 'react';
import { PlayCircle, Loader2, ListVideo } from 'lucide-react';

export default function App() {
  const [animeId, setAnimeId] = useState('1');
  const [epNum, setEpNum] = useState('1');
  const [server, setServer] = useState('hd-1'); // hd-1 or hd-2
  const [type, setType] = useState('sub'); // sub or dub
  const [loadingStream, setLoadingStream] = useState(false);
  const [loadingEps, setLoadingEps] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTestStreamAPI = async () => {
    setLoadingStream(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/stream?id=${animeId}&ep=${epNum}&server=${server}&type=${type}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }
      setResult({ endpoint: '/api/stream', data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingStream(false);
    }
  };

  const handleTestEpisodesAPI = async () => {
    setLoadingEps(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/episodes?id=${animeId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }
      setResult({ endpoint: '/api/episodes', data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingEps(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans selection:bg-rose-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Miruro Native API</h1>
          <p className="text-neutral-400">
            Fully unrestricted CORS enabled endpoints. You can hit these directly from any front-end.
          </p>
          <div className="mt-4 flex flex-col gap-2">
			  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-sm font-mono text-emerald-400 break-all">
				 GET /api/episodes?id={'{anime_id}'}
			  </div>
			  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-sm font-mono text-emerald-400 break-all">
				 GET /api/stream?id={'{anime_id}'}&ep={'{ep_num}'}&server={'{hd-1/hd-2}'}&type={'{sub/dub}'}
			  </div>
          </div>
        </div>

        {/* Input Panel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">AniList ID</label>
              <input
                type="text"
                value={animeId}
                onChange={(e) => setAnimeId(e.target.value)}
                placeholder="1"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 cursor-text font-mono"
              />
            </div>
            <div className="space-y-2 lg:border-l lg:border-neutral-800 lg:pl-6">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Episode</label>
              <input
                type="text"
                value={epNum}
                onChange={(e) => setEpNum(e.target.value)}
                placeholder="1"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 cursor-text font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Server</label>
              <select
                value={server}
                onChange={(e) => setServer(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 appearance-none cursor-pointer"
              >
                <option value="hd-1">HD-1 (Arc)</option>
                <option value="hd-2">HD-2 (Bee)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 appearance-none cursor-pointer"
              >
                <option value="sub">Sub</option>
                <option value="dub">Dub</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button
               onClick={handleTestEpisodesAPI}
               disabled={loadingEps || loadingStream || !animeId}
               className="w-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-semibold tracking-wide rounded-lg px-6 py-3 flex items-center justify-center transition-colors cursor-pointer border border-neutral-700"
             >
               {loadingEps ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ListVideo className="w-5 h-5 mr-2" />}
               Test Episodes API
             </button>

             <button
               onClick={handleTestStreamAPI}
               disabled={loadingEps || loadingStream || !animeId || !epNum}
               className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold tracking-wide rounded-lg px-6 py-3 flex items-center justify-center transition-colors cursor-pointer"
             >
               {loadingStream ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <PlayCircle className="w-5 h-5 mr-2" />}
               Test Stream API (HLS)
             </button>
          </div>
        </div>

        {/* Status / Errors */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4">
            <p className="font-medium">API Error: {error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[600px]">
            <div className="bg-neutral-950/80 px-6 py-4 border-b border-neutral-800 flex justify-between items-center backdrop-blur-sm">
              <h2 className="font-semibold text-neutral-200">Raw JSON Sent by Backend</h2>
              <span className="text-xs font-mono px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
                 {result.endpoint}
              </span>
            </div>
            <div className="p-0 overflow-auto flex-1 bg-neutral-950/30 scrollbar-thin scrollbar-thumb-neutral-800">
              <pre className="text-[13px] leading-relaxed text-emerald-400/90 font-mono p-6">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
