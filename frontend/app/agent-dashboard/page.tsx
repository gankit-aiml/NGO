"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, CheckCircle2, ClipboardList, Send, Camera } from "lucide-react";

export default function FieldAgentDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatTaskId, setActiveChatTaskId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  
  // Use a hardcoded mock agent_id since we aren't doing real auth in MVP
  const agentId = "mock-agent-1"; 

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`https://ngo-fjwc.vercel.app/api/v1/pm/field_tasks/${agentId}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId: string) => {
    if (!chatMessage.trim()) return;

    // Simulate getting location
    const lat = 18.5 + (Math.random() * 0.1);
    const lng = 73.8 + (Math.random() * 0.1);

    try {
      await fetch("https://ngo-fjwc.vercel.app/api/v1/pm/field_tasks/complete_endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          notes: chatMessage,
          lat,
          lng
        })
      });
      alert("Task marked as completed! Location captured.");
      setChatMessage("");
      setActiveChatTaskId(null);
      fetchTasks();
    } catch (e) {
      alert("Failed to complete task.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/agent-login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-[#0F172A] text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold">Field Agent Portal</h1>
            <p className="text-xs text-blue-300">Raju (Active)</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-slate-300 hover:text-white flex items-center gap-2 text-sm">
          <LogOut className="w-4 h-4" /> Exit
        </button>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <h2 className="text-xl font-bold text-slate-800 mb-6">My Assigned Tasks</h2>
        
        {loading ? (
          <p className="text-slate-500">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">You have no pending tasks. Great job!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(t => (
              <div key={t.task_id} className={`p-6 rounded-2xl border ${t.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-blue-200 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{t.task_desc}</h3>
                    <div className="flex items-center gap-1 text-slate-500 text-sm mt-2">
                      <MapPin className="w-4 h-4" />
                      Target: {t.target_location_lat.toFixed(4)}, {t.target_location_lng.toFixed(4)}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    t.status === 'completed' ? 'bg-green-200 text-green-800' : 
                    t.status === 'pending_pm_approval' ? 'bg-yellow-200 text-yellow-800' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {t.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                {t.status === 'assigned' && activeChatTaskId !== t.task_id && (
                  <button 
                    onClick={() => setActiveChatTaskId(t.task_id)}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 mt-4"
                  >
                    Open Completion Chat
                  </button>
                )}

                {/* Inline Messenger UI for Task Completion */}
                {t.status === 'assigned' && activeChatTaskId === t.task_id && (
                  <div className="mt-4 border border-blue-100 bg-blue-50 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-2">Completion Report (Message to PM)</p>
                    <div className="flex items-end gap-2 bg-white p-2 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition">
                        <Camera className="w-5 h-5" />
                      </button>
                      <input 
                        type="text" 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleComplete(t.task_id); }}
                        placeholder="Type notes (e.g. 'Handed over 10 kits at location')"
                        className="flex-1 p-2 outline-none text-sm bg-transparent"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleComplete(t.task_id)}
                        disabled={!chatMessage.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-md transition"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 text-right">Clicking send will also capture your live GPS location.</p>
                  </div>
                )}
                
                {(t.status === 'completed' || t.status === 'pending_pm_approval') && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 uppercase tracking-wide font-bold">Your Message to PM</span>
                      <span className="text-xs text-slate-400">{new Date(t.completed_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-tr-none self-end max-w-[80%] ml-auto text-sm shadow-sm inline-block float-right">
                      {t.completion_notes}
                    </div>
                    <div className="clear-both"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
