"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, KeyRound, ArrowRight } from "lucide-react";

export default function AccountantLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("userRole", "ngo_accountant");
      localStorage.setItem("userName", "Priya (Chief Accountant)");
      router.push("/accountant-dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6 border border-purple-200">
            <Calculator className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Accounting Portal</h1>
          <p className="text-slate-500">Secure access to NGO ledgers and audits</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="text"
                disabled
                value="priya.accountant@ngo.org"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 focus:outline-none cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  disabled
                  value="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 focus:outline-none cursor-not-allowed"
                />
                <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl px-4 py-3.5 transition-all flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Simulate Login (Priya)
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-center text-slate-500 mt-4">
              MVP Mode: Login is simulated for demo purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
