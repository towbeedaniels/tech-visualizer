"use client";

import { useState } from "react";
import { performInstantScan } from "./actions";
import { Toaster, toast } from "sonner";
import { Search, ShieldCheck, ShieldAlert, Globe, Info } from "lucide-react";

export default function GoogleSpy() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = await performInstantScan(url);
    if (data.success) {
      setResult(data);
      if (!data.tech || data.tech.length === 0) {
        toast.info("No tech found");
      }
    } else {
      toast.error(data.error);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      <Toaster position="bottom-center" richColors />

      {/* Mini Nav */}
      {/* <nav className="p-4 flex justify-end gap-6 text-sm text-gray-600 items-center">
        <a href="#" className="hover:underline">Support</a>
        <a href="#" className="hover:underline">Documentation</a>
        <div className="h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">O</div>
      </nav> */}

      <div
        className={`flex flex-col items-center transition-all duration-500 px-4 ${result ? "pt-6" : "pt-32"}`}
      >
        {/* Animated Logo */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 select-none">
          <span className="text-blue-500">T</span>
          <span className="text-red-500">e</span>
          <span className="text-yellow-500">c</span>
          <span className="text-blue-500">h</span>
          <span className="text-green-500">S</span>
          <span className="text-red-500">p</span>
          <span className="text-yellow-500">y</span>
        </h1>

        {/* Google-Style Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-[584px]">
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL to analyze..."
              className="w-full py-4 pl-14 pr-6 border border-gray-200 rounded-full hover:shadow-lg focus:shadow-lg outline-none transition-all text-lg"
            />
          </div>
          {!result && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                disabled={loading}
                className="bg-gray-50 border border-transparent hover:border-gray-200 px-5 py-2 rounded text-sm text-gray-700 transition-colors"
              >
                {loading ? "Analyzing..." : "Tech Scan"}
              </button>
              <button
                type="button"
                className="bg-gray-50 border border-transparent hover:border-gray-200 px-5 py-2 rounded text-sm text-gray-700 transition-colors"
              >
                I'm Feeling Techy
              </button>
            </div>
          )}
        </form>

        {/* Search Results Content */}
        {result && (
          <div className="w-full max-w-3xl mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Metadata Section */}
            <div className="mb-10 border-b pb-8 border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-3 w-3 text-gray-400" />
                <p className="text-sm text-gray-600 truncate">{result.url}</p>
              </div>
              <h2 className="text-2xl text-blue-800 hover:underline cursor-pointer font-medium mb-2 leading-tight">
                {result.metadata.title}
              </h2>
              <p className="text-gray-700 leading-relaxed text-[15px] mb-4">
                {result.metadata.description}
              </p>

              {/* SSL Status Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${result.isSecure ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                {result.isSecure ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
                {result.isSecure
                  ? "SSL Connection Secure"
                  : "Insecure Connection"}
              </div>
            </div>

            {/* Aesthetic Tech Stack Grid */}
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
              Technologies Detected
            </h3>
            {result.tech.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.tech.map((t: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-400 transition-all group"
                  >
                    <div className="h-12 w-12 flex-shrink-0 bg-gray-50 p-2 rounded-xl group-hover:scale-110 transition-transform">
                      <img
                        src={t.logo}
                        alt={t.name}
                        className="h-full w-full object-contain"
                        onError={(e) =>
                          (e.currentTarget.src =
                            "https://cdn.simpleicons.org/codeigniter")
                        }
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {t.name}
                      </h4>
                      <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">
                        {t.cat}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Info className="h-10 w-10 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">
                  No standard fingerprints matched this site's source code.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
