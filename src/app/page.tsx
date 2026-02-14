/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { performInstantScan } from './actions';
import { Toaster, toast } from 'sonner';
import { Search, Globe, ShieldCheck, Zap, Info } from 'lucide-react';

export default function GoogleSpy() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = await performInstantScan(url);
    if (data.success) {
      setResult(data);
    } else {
      toast.error(data.error);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      <Toaster position="bottom-center" richColors />
      
      {/* Header / Nav */}
      <nav className="p-4 flex justify-end gap-4 text-sm text-gray-700">
        <a href="#" className="hover:underline">About</a>
        <a href="#" className="hover:underline">Store</a>
        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">O</div>
      </nav>

      <div className={`flex flex-col items-center transition-all duration-700 ${result ? 'pt-10' : 'pt-32'}`}>
        {/* Logo */}
        <h1 className="text-7xl font-bold tracking-tighter mb-8">
          <span className="text-blue-500">T</span>
          <span className="text-red-500">e</span>
          <span className="text-yellow-500">c</span>
          <span className="text-blue-500">h</span>
          <span className="text-green-500">S</span>
          <span className="text-red-500">p</span>
          <span className="text-yellow-500">y</span>
        </h1>

        {/* Search Bar Area */}
        <form onSubmit={handleSearch} className="w-full max-w-146 px-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="url" required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Search a URL to see its stack..."
              className="w-full py-3.5 pl-12 pr-4 border border-gray-200 rounded-full hover:shadow-md focus:shadow-md outline-none transition-shadow text-lg"
            />
          </div>
          <div className="flex justify-center gap-3 mt-8">
            <button disabled={loading} className="bg-gray-50 border border-transparent hover:border-gray-200 px-6 py-2 rounded text-sm text-gray-800">
              {loading ? "Scanning..." : "Tech Search"}
            </button>
            <button type="button" className="bg-gray-50 border border-transparent hover:border-gray-200 px-6 py-2 rounded text-sm text-gray-800">
              I am Feeling Lucky
            </button>
          </div>
        </form>

        {/* Result Area */}
        {result && (
          <div className="w-full max-w-3xl mt-12 px-6 animate-in fade-in duration-700">
            {/* Metadata Snippet */}
            <div className="mb-10">
              <p className="text-sm text-gray-600 truncate mb-1">{result.url}</p>
              <h2 className="text-xl text-blue-800 hover:underline cursor-pointer font-medium mb-1">
                {result.metadata.title}
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">
                {result.metadata.description}
              </p>
            </div>

            {/* Tech Stack Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.tech.map((t: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="h-10 w-10 shrink-0">
                    <Image src={t.logo} alt={t.name} width={40} height={40} className="h-full w-full object-contain"
                           onError={(e) => (e.currentTarget.src = "https://cdn.simpleicons.org/codeigniter")} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-xs text-gray-500 font-semibold uppercase">{t.cat}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}