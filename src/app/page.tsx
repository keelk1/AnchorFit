'use client';

import { useState, useMemo } from 'react';
import { computeAIx, Investor } from '../lib/aixEngine';
import investorsData from '../data/investors.json';

export default function Home() {
  const [targetRaise, setTargetRaise] = useState<number>(800000);
  const [targetCountry, setTargetCountry] = useState<string>('France');

  const processedVCs = useMemo(() => {
    const list = investorsData as Investor[];
    
    return list
      .map((vc) => {
        const scoreDetails = computeAIx(vc, targetRaise, targetCountry);
        return { ...vc, scoreDetails };
      })
      .filter((vc) => vc.scoreDetails.tier !== 'U')
      .sort((a, b) => b.scoreDetails.finalScore - a.scoreDetails.finalScore);
  }, [targetRaise, targetCountry]);

  const tierA = processedVCs.filter((vc) => vc.scoreDetails.tier === 'A');
  const tierB = processedVCs.filter((vc) => vc.scoreDetails.tier === 'B');
  const tierC = processedVCs.filter((vc) => vc.scoreDetails.tier === 'C');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">AnchorFit</h1>
            <p className="text-sm text-slate-500">Data-Driven Venture Capital Prioritization</p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
            Global Database • 6,000+ VCs
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-6">
          <h2 className="text-lg font-semibold border-b border-slate-100 pb-3">1. Round Configuration</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Raise (€ / CHF)</label>
            <input
              type="number"
              value={targetRaise}
              onChange={(e) => setTargetRaise(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Country</label>
            <select
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition"
            >
              <option value="France">France 🇫🇷</option>
              <option value="Switzerland">Switzerland 🇨🇭</option>
              <option value="United States">United States 🇺🇸</option>
              <option value="United Kingdom">United Kingdom 🇬🇧</option>
              <option value="Germany">Germany 🇩🇪</option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
              <span className="block text-2xl font-bold text-emerald-700">{tierA.length}</span>
              <span className="text-xs font-medium text-emerald-600">Tier A (High Fit)</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
              <span className="block text-2xl font-bold text-amber-700">{tierB.length}</span>
              <span className="text-xs font-medium text-amber-600">Tier B (Mid Fit)</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-center">
              <span className="block text-2xl font-bold text-rose-700">{tierC.length}</span>
              <span className="text-xs font-medium text-rose-600">Tier C (Low Fit)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Prioritized Investors Pipeline</h3>
              <span className="text-xs text-slate-500">Sorted by AIx Alignment Index</span>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {processedVCs.slice(0, 50).map((vc, idx) => {
                const badgeColor = 
                  vc.scoreDetails.tier === 'A' ? 'bg-emerald-100 text-emerald-800' :
                  vc.scoreDetails.tier === 'B' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800';

                return (
                  <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900">{vc.name}</h4>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeColor}`}>
                          Tier {vc.scoreDetails.tier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-md">
                        HQ: {vc.hq || 'Global'} • Range: {vc.minCheque ? `${(vc.minCheque/1000)}k` : 'N/A'} - {vc.maxCheque ? `${(vc.maxCheque/1000000)}M` : 'N/A'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="block text-2xl font-extrabold text-indigo-600">
                        {vc.scoreDetails.finalScore}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        AIx Score
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
