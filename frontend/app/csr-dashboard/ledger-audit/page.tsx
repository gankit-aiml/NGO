'use client';

import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LedgerAudit() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#0F172A] text-white p-4 px-8 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-bold">CSR Trust Oracle</h1>
        </div>
        <nav className="flex space-x-6 text-sm font-medium">
          <Link href="/csr-dashboard" className="text-slate-400 hover:text-white transition">Portfolio</Link>
          <Link href="/csr-dashboard/ledger-audit" className="text-white border-b-2 border-emerald-400 pb-1">Ledger Audit</Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Ledger Audit</h2>
            <p className="text-slate-500 mt-1">Review the cryptographic logs of all transactions.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
          <h2 className="text-xl font-medium text-slate-500 mb-2">Immutable Ledger Data Coming Soon</h2>
          <p className="text-slate-400 max-w-md text-center">This page will directly query the Supabase database to prove zero data manipulation.</p>
        </div>
      </main>
    </div>
  );
}
