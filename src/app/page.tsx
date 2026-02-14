/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { performInstantScan } from './actions';
import { Toaster, toast } from 'sonner';

export default function InstantSpy() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleAction(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const data = await performInstantScan(url);

    if (data.success) {
      setResult(data);
      toast.success(`Scan complete for ${url}`);
    } else {
      toast.error(data.error);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white p-8 md:p-24 text-slate-900 font-sans">
      <Toaster position="top-center" richColors />
      
      <div className="max-w-2xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">TechSpy_</h1>
          <p className="text-slate-400 font-medium">Instant stack detection. No storage. No tracking.</p>
        </header>

        <form onSubmit={handleAction} className="relative group">
          <input 
            type="url" 
            required
            placeholder="Paste URL (e.g. https://github.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all text-lg font-mono"
          />
          <button 
            disabled={loading}
            className="absolute right-3 top-3 bottom-3 bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-lg shadow-blue-200"
          >
            {loading ? "Scanning..." : "Go"}
          </button>
        </form>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Result
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {result.tech.length > 0 ? result.tech.map((t: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-200 transition-colors">
                  <span className="text-lg font-bold">{t.name}</span>
                  <span className="text-[10px] bg-white border border-slate-200 px-3 py-1 rounded-full font-black text-slate-500 uppercase">{t.cat}</span>
                </div>
              )) : (
                <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-400">
                  No common fingerprints detected on this page.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}