/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { performInstantScan } from "./actions";
import { Toaster, toast } from "sonner";

export default function InstantSpy() {
  const [url, setUrl] = useState("");
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
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">
            TechSpy_
          </h1>
          <p className="text-slate-400 font-medium">
            Instant stack detection. No storage. No tracking.
          </p>
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
          <div className="space-y-4">
            {result.tech.length > 0 ? (
              result.tech.map((t: any, i: number) => (
                <div
                  key={i}
                  className="p-4 border rounded-xl flex justify-between bg-white shadow-sm"
                >
                  <span className="font-bold">{t.name}</span>
                  <span className="text-xs text-gray-400 uppercase">
                    {t.cat}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 border-2 border-dashed rounded-xl text-center text-gray-500">
                No fingerprints found. This site might be using a very custom
                stack or blocking the scanner.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
