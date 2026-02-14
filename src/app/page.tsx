/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { analyzeStack } from './actions';
import { Toaster, toast } from 'sonner';

export default function Home() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const res = await analyzeStack(url);
    
    if (res.success) {
      setResults(res.technologies || []);
      toast.success("Scan complete!");
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  }

  return (
    <main className="max-w-2xl mx-auto p-10 font-sans">
      <Toaster richColors />
      <h1 className="text-3xl font-bold mb-6">Free Stack Scanner</h1>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-10">
        <input 
          type="url" 
          placeholder="https://example.com" 
          required
          className="flex-1 border p-3 rounded-lg outline-none focus:border-blue-500"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button 
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Scanning..." : "Analyze"}
        </button>
      </form>

      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((tech, i) => (
            <div key={i} className="p-4 border rounded-xl flex justify-between items-center">
              <span className="font-semibold">{tech.name}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase">{tech.cat}</span>
            </div>
          ))
        ) : !loading && <p className="text-gray-400 text-center">No technologies detected yet.</p>}
      </div>
    </main>
  );
}