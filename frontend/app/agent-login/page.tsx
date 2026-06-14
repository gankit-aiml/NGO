"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, KeyRound, ArrowRight } from "lucide-react";

export default function AgentLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      localStorage.setItem("userRole", "field_worker");
      localStorage.setItem("userName", "Raju (Field Worker)");
      router.push("/agent-dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 mb-6 border border-blue-500/20">
            <User className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Agent Portal</h1>
          <p className="text-slate-400">Sign in to access your field operations</p>
        </div>

        <div className="bg-[#1f2833] rounded-2xl p-6 shadow-xl border border-slate-800">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="text"
                disabled
                value="+91 98765 43210"
                className="w-full bg-[#0b0c10] border border-slate-700 rounded-xl px-4 py-3 text-slate-500 focus:outline-none cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Access PIN</label>
              <div className="relative">
                <input
                  type="password"
                  disabled
                  value="••••"
                  className="w-full bg-[#0b0c10] border border-slate-700 rounded-xl px-4 py-3 text-slate-500 focus:outline-none cursor-not-allowed"
                />
                <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl px-4 py-3.5 transition-all flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Simulate Login (Raju)
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
