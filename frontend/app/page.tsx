import Link from 'next/link';
import { ArrowRight, Building2, UserCircle2, MapPin, Calculator } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="max-w-4xl w-full p-8 text-center">
        <h1 className="text-4xl font-bold text-[#0F172A] mb-4">NGO Co-Pilot & CSR Trust Oracle</h1>
        <p className="text-lg text-slate-600 mb-12">Select your role to view the MVP Demo Dashboards.</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* NGO Director */}
          <Link href="/ngo-dashboard" className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-[#0F172A] transition group text-left">
            <UserCircle2 className="w-12 h-12 text-[#0F172A] mb-4" />
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-2">NGO Director</h2>
            <p className="text-slate-500 mb-6">Manage field operations, AI action cards, and OCR approvals.</p>
            <span className="flex items-center text-[#059669] font-medium group-hover:translate-x-1 transition-transform">
              Launch Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </span>
          </Link>

          {/* CSR Funder */}
          <Link href="/csr-dashboard" className="bg-[#0F172A] p-8 rounded-xl shadow-sm hover:shadow-md transition group text-left relative overflow-hidden">
            <Building2 className="w-12 h-12 text-white mb-4 relative z-10" />
            <h2 className="text-2xl font-semibold text-white mb-2 relative z-10">CSR Funder</h2>
            <p className="text-slate-300 mb-6 relative z-10">View transparent ledger, portfolio impact maps, and metrics.</p>
            <span className="flex items-center text-emerald-400 font-medium group-hover:translate-x-1 transition-transform relative z-10">
              Launch Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </span>
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </Link>
          
          {/* Field Agent */}
          <Link href="/agent-login" className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-blue-500 transition group text-left">
            <MapPin className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-2">Field Agent</h2>
            <p className="text-slate-500 mb-6">Upload photos and text to report impact in real-time.</p>
            <span className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
              Agent Portal <ArrowRight className="w-4 h-4 ml-2" />
            </span>
          </Link>

          {/* NGO Accountant */}
          <Link href="/accountant-login" className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-purple-500 transition group text-left">
            <Calculator className="w-12 h-12 text-purple-500 mb-4" />
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-2">NGO Accountant</h2>
            <p className="text-slate-500 mb-6">Process vendor bills, maintain ledgers, and export audits.</p>
            <span className="flex items-center text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
              Accountant Portal <ArrowRight className="w-4 h-4 ml-2" />
            </span>
          </Link>
          {/* Project Manager */}
          <Link href="/project-manager-dashboard" className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-orange-500 transition group text-left">
            <UserCircle2 className="w-12 h-12 text-orange-500 mb-4" />
            <h2 className="text-2xl font-semibold text-[#0F172A] mb-2">Project Manager</h2>
            <p className="text-slate-500 mb-6">Create AI Charters, manage procurement, and dispatch field agents.</p>
            <span className="flex items-center text-orange-600 font-medium group-hover:translate-x-1 transition-transform">
              PM Portal <ArrowRight className="w-4 h-4 ml-2" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
