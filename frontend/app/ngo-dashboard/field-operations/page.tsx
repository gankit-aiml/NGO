'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, CheckCircle } from 'lucide-react';

export default function FieldOperations() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('https://ngo-fjwc.vercel.app/api/v1/funder/impact-logs');
        const data = await res.json();
        if (data.status === 'success') {
          setLogs(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8">NGO Command</h2>
        <nav className="space-y-4">
          <Link href="/ngo-dashboard" className="block px-4 py-2 text-slate-400 hover:text-white">Inbox (Approvals)</Link>
          <Link href="/ngo-dashboard/field-operations" className="block px-4 py-2 bg-white/10 rounded-md">Field Operations</Link>
          <Link href="/ngo-dashboard/finance" className="block px-4 py-2 text-slate-400 hover:text-white">Finance</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Field Operations</h1>
            <p className="text-slate-500">View WhatsApp submissions and impact tracking.</p>
          </div>
        </header>

        {logs.length === 0 ? (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
            <h2 className="text-xl font-medium text-slate-500 mb-2">Listening for WhatsApp Messages...</h2>
            <p className="text-slate-400 max-w-md text-center">Once a field worker sends a message to your WhatsApp bot, the AI will extract it and display it here in real-time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.log_id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="font-semibold text-[#0F172A] uppercase tracking-wide text-sm">{log.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-slate-600 font-medium mb-1">{log.masked_narrative}</p>
                  <div className="flex items-center text-sm text-slate-400">
                    <MapPin className="w-4 h-4 mr-1" />
                    {log.gps_coordinates || "Unknown Location"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#0F172A]">{log.quantity_delivered}</span>
                  <span className="block text-xs font-medium text-slate-500 uppercase">Items Delivered</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
