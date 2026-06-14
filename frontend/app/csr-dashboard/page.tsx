'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import GraphComponent from '@/components/complex/GraphComponent';

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import('@/components/complex/MapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500">Loading Map...</div>
});

export default function CSRDashboard() {
  const [metrics, setMetrics] = useState({
    total_deployed: 500000,
    verified_disbursed: 0,
    utilization_percentage: 0
  });

  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/funder/dashboard-metrics');
        const data = await res.json();
        if (data.status === 'success') {
          setMetrics({
            total_deployed: data.total_deployed,
            verified_disbursed: data.verified_disbursed,
            utilization_percentage: data.utilization_percentage
          });
        }
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      }
    };
    
    const fetchFieldOps = async () => {
      try {
        const [agentsRes, tasksRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/v1/pm/field_agents'),
          fetch('http://127.0.0.1:8000/api/v1/pm/field_tasks')
        ]);
        const agentsData = await agentsRes.json();
        const tasksData = await tasksRes.json();
        setAgents(agentsData.agents || []);
        setTasks(tasksData.tasks || []);
      } catch (e) {
        console.error("Failed to fetch field ops", e);
      }
    }

    fetchMetrics();
    fetchFieldOps();
    // Poll every 5 seconds for real-time MVP feel
    const interval = setInterval(() => {
      fetchMetrics();
      fetchFieldOps();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#0F172A] text-white p-4 px-8 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-bold">CSR Trust Oracle</h1>
        </div>
        <nav className="flex space-x-6 text-sm font-medium">
          <Link href="/csr-dashboard" className="text-white border-b-2 border-emerald-400 pb-1">Portfolio</Link>
          <Link href="/csr-dashboard/ledger-audit" className="text-slate-400 hover:text-white transition">Ledger Audit</Link>
          <button className="text-slate-400 hover:text-white transition">Export Report</button>
        </nav>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Portfolio Overview</h2>
            <p className="text-slate-500 mt-1">Real-time immutable impact tracking.</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider block">Total Deployed</span>
            <span className="text-3xl font-bold text-[#059669]">₹{metrics.total_deployed.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Real Map Component */}
          <div className="lg:col-span-2 bg-slate-200 rounded-xl overflow-hidden relative border border-slate-300 h-[500px]">
            <MapComponent agents={agents} tasks={tasks} />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Project: Education 2026</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Target</span>
                    <span className="font-medium text-[#0F172A]">500 Bags</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full">
                    <div className="bg-[#0F172A] h-2 rounded-full w-[10%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Funds Utilized</span>
                    <span className="font-medium text-[#0F172A]">{metrics.utilization_percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full">
                    <div className="bg-[#059669] h-2 rounded-full" style={{ width: `${Math.min(metrics.utilization_percentage, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Utilization Trend</h4>
              <div className="h-40">
                <GraphComponent />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">Reports & Documentation</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-lg p-4 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-800">Financial Audit Report</h3>
                <p className="text-sm text-slate-500">Latest double-entry ledger & compliance audit.</p>
              </div>
              <button 
                onClick={() => window.open("http://127.0.0.1:8000/api/v1/finance/audit-report", "_blank")}
                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-md font-medium text-sm transition"
              >
                Download PDF
              </button>
            </div>
            
            <div className="border border-slate-200 rounded-lg p-4 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-800">Approved Project Charter</h3>
                <p className="text-sm text-slate-500">Official project scope and deliverables.</p>
              </div>
              <button 
                onClick={() => alert("To view the Project Charter PDF, the PM or NGO Head generates and emails it in this MVP.")}
                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-md font-medium text-sm transition"
              >
                Request PDF
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
