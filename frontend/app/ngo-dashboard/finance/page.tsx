'use client';

import Link from 'next/link';

export default function Finance() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8">NGO Command</h2>
        <nav className="space-y-4">
          <Link href="/ngo-dashboard" className="block px-4 py-2 text-slate-400 hover:text-white">Inbox (Approvals)</Link>
          <Link href="/ngo-dashboard/field-operations" className="block px-4 py-2 text-slate-400 hover:text-white">Field Operations</Link>
          <Link href="/ngo-dashboard/finance" className="block px-4 py-2 bg-white/10 rounded-md">Finance</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Finance Hub</h1>
            <p className="text-slate-500">Track budgets, review historical expenses, and generate reports.</p>
          </div>
        </header>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
          <h2 className="text-xl font-medium text-slate-500 mb-2">Detailed Financial Ledger Coming Soon</h2>
          <p className="text-slate-400 max-w-md text-center">This section will show the full history of approved expenses from the Supabase ledger.</p>
        </div>
      </main>
    </div>
  );
}
