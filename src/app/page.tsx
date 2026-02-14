"use client";

import { useState } from 'react';
import Image from 'next/image';
import { performInstantScan } from './actions';
import { Toaster, toast } from 'sonner';
import { Search, Globe, ShieldCheck, ShieldAlert, Laptop, Info } from 'lucide-react';

interface Tech {
  name: string;
  cat: string;
  logo: string;
}

interface ScanResult {
  success: boolean;
  url?: string;
  isSecure?: boolean;
  metadata?: { title: string; description: string };
  tech?: Tech[];
  error?: string;
}

export default function GoogleSpy() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const data = await performInstantScan(url);
    if (data.success) {
      setResult(data as ScanResult);
    } else {
      toast.error(data.error);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 px-6">
      <Toaster position="bottom-center" richColors />
      
      {/* Nav Section */}
      <nav className="flex justify-end py-4 gap-4 text-sm items-center">
        <a href="#" className="text-gray-600 hover:underline">Images</a>
        <a href="#" className="text-gray-600 hover:underline">Settings</a>
        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">OD</div>
      </nav>

      {/* Main Container */}
      <div className={`flex flex-col items-center transition-all duration-700 ${result ? 'pt-8' : 'pt-36'}`}>
        <h1 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter select-none">
          <span className="text-blue-500">T</span><span className="text-red-500">e</span><span className="text-yellow-500">c</span><span className="text-blue-500">h</span><span className="text-green-500">S</span><span className="text-red-500">p</span><span className="text-yellow-500">y</span>
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-150 mb-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="url" required value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste website link here..."
              className="w-full py-4 pl-14 pr-6 border border-gray-200 rounded-full hover:shadow-lg focus:shadow-lg outline-none transition-all text-lg font-light"
            />
          </div>
        </form>

        {/* Results Section */}
        {result && (
          <div className="w-full max-w-3xl pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="mb-12 border-b border-gray-100 pb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-mono">
                <Globe className="h-4 w-4" /> {result.url}
              </div>
              <h2 className="text-2xl text-blue-800 font-medium mb-2 hover:underline cursor-pointer">{result.metadata?.title}</h2>
              <p className="text-gray-600 text-md leading-relaxed mb-4">{result.metadata?.description}</p>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${result.isSecure ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {result.isSecure ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                {result.isSecure ? 'SSL Connection Valid' : 'Insecure Site'}
              </div>
            </div>

            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Laptop className="h-4 w-4" /> Tech Stack Analysis
            </h3>

            {result.tech && result.tech.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.tech.map((t: Tech, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50 transition-all group">
                    <Image src={t.logo} alt={t.name} width={40} height={40} className="h-10 w-10 grayscale group-hover:grayscale-0 transition-all" 
                         onError={(e) => { e.currentTarget.src = "https://cdn.simpleicons.org/codeigniter"; }} />
                    <div>
                      <div className="font-bold text-gray-900">{t.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{t.cat}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                <Info className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No common fingerprints detected. This site may be using custom code or server-side rendering that obscures its library signatures.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}