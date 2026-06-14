"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, FileText, ShoppingCart, Truck, CheckCircle2, UserCircle2, ArrowRight, Download, ClipboardCheck } from "lucide-react";

export default function ProjectManagerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("charter");

  // Charter State
  const [coreElements, setCoreElements] = useState("Target: Distribute 1000 food kits in rural Pune. Budget: 5L. Timeline: 1 month.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [charter, setCharter] = useState<any>(null);
  const [editableCharterText, setEditableCharterText] = useState("");
  const charterRef = useRef<HTMLDivElement>(null);
  
  // Procurement State
  const [requirements, setRequirements] = useState("");
  const [isSourcing, setIsSourcing] = useState(false);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Dispatch State
  const [tasks, setTasks] = useState("Deliver 50 kits to Haveli village\nDeliver 50 kits to Khed village");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);

  // Task Review State
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "task-review") {
      fetchPendingTasks();
    }
  }, [activeTab]);

  const fetchPendingTasks = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/pm/field_tasks");
      const data = await res.json();
      setPendingTasks(data.tasks.filter((t: any) => t.status === "pending_pm_approval"));
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateCharter = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/pm/charter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ core_elements: coreElements, project_id: "test" })
      });
      const data = await res.json();
      setCharter(data.charter);
      setEditableCharterText(JSON.stringify(data.charter, null, 2));
    } catch (e) {
      alert("Error generating charter");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateCharterEditor = (e: any) => {
    setEditableCharterText(e.target.value);
    try {
      setCharter(JSON.parse(e.target.value));
    } catch (err) {
      // invalid json, ignore until valid
    }
  };

  const handleSubmitCharter = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/v1/pm/charter/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          project_id: "d1d88ca6-d5ee-4f4c-b3f5-de1e22699ff9", 
          manager_id: "pm-1", 
          content: charter 
        })
      });
      alert("Charter submitted to NGO Head for approval!");
    } catch (e) {
      alert("Error submitting charter");
    }
  };

  const handleDownloadPDF = () => {
    if (charterRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Project Charter</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #000; }
                h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                h3 { font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 24px; margin-bottom: 12px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #000; margin-bottom: 20px; }
                .grid > div { border-bottom: 1px solid #ccc; padding: 10px; }
                .grid > div:nth-child(odd) { border-right: 1px solid #ccc; }
                .font-bold { font-weight: bold; }
                ul { margin-top: 5px; padding-left: 20px; }
                li { margin-bottom: 5px; }
                .bg-slate-100 { background-color: #f1f5f9; padding: 10px; border-radius: 4px; margin-bottom: 10px; }
              </style>
            </head>
            <body>
              ${charterRef.current.innerHTML}
              <script>
                window.onload = () => {
                  window.print();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleAutoSuggestProcurement = async () => {
    setIsSuggesting(true);
    try {
      // Check if project is approved by looking at charters
      const res = await fetch("http://127.0.0.1:8000/api/v1/pm/charters");
      const data = await res.json();
      const approvedCharter = data.data.find((c: any) => c.status === "approved");
      
      if (!approvedCharter) {
        alert("Procurement blocked: Project Charter must be approved by NGO Head first.");
        setIsSuggesting(false);
        return;
      }

      // Hit our new endpoint to suggest based on approved charter
      const suggRes = await fetch("http://127.0.0.1:8000/api/v1/pm/procurement/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charter_content: approvedCharter.content })
      });
      const suggData = await suggRes.json();
      setRequirements(suggData.suggestions);
    } catch (e) {
      console.error(e);
      alert("Failed to auto-suggest procurement");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSourceProcurement = async () => {
    setIsSourcing(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/pm/procurement/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: "test", requirements })
      });
      const data = await res.json();
      setQuotes(data.quotes);
    } catch (e) {
      alert("Error fetching quotes");
    } finally {
      setIsSourcing(false);
    }
  };

  const handleAssignDispatch = async () => {
    setIsAssigning(true);
    try {
      const taskList = tasks.split("\n").map((t) => ({
        task_desc: t,
        target_lat: 18.5204 + (Math.random() * 0.1),
        target_lng: 73.8567 + (Math.random() * 0.1)
      }));
      const res = await fetch("http://127.0.0.1:8000/api/v1/pm/dispatch/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: "test", tasks: taskList })
      });
      const data = await res.json();
      setAssignments(data.assignments);
    } catch (e) {
      alert("Error assigning dispatch");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleTaskAction = async (taskId: string, action: "approve" | "reject") => {
    try {
      await fetch("http://127.0.0.1:8000/api/v1/pm/field_tasks/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, action })
      });
      alert(`Task ${action}d successfully`);
      fetchPendingTasks();
    } catch (e) {
      alert("Error reviewing task");
    }
  };

  const handleLogout = () => {
    router.push("/");
  };

  const RenderField = ({ data }: { data: any }) => {
    if (typeof data === 'string' || typeof data === 'number') return <span>{data}</span>;
    if (Array.isArray(data)) {
      return (
        <ul className="list-disc pl-5 mt-1 space-y-1">
          {data.map((item, idx) => <li key={idx}><RenderField data={item} /></li>)}
        </ul>
      );
    }
    if (typeof data === 'object' && data !== null) {
      return (
        <div className="mt-2 space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="bg-slate-100 p-2 rounded-md">
              <span className="font-semibold text-slate-800 capitalize block mb-1">{key.replace(/_/g, ' ')}:</span>
              <RenderField data={value} />
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <UserCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold">Project Mgr</h2>
              <p className="text-xs text-slate-400">Arjun (PM)</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab("charter")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "charter" ? "bg-orange-500 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
            <FileText className="w-5 h-5" /> Charter Generation
          </button>
          <button onClick={() => setActiveTab("procurement")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "procurement" ? "bg-orange-500 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
            <ShoppingCart className="w-5 h-5" /> Procurement Agent
          </button>
          <button onClick={() => setActiveTab("dispatch")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "dispatch" ? "bg-orange-500 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
            <Truck className="w-5 h-5" /> Field Dispatch
          </button>
          <button onClick={() => setActiveTab("task-review")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "task-review" ? "bg-orange-500 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
            <ClipboardCheck className="w-5 h-5" /> Task Review
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 capitalize">
          {activeTab.replace("-", " ")}
        </h1>

        {activeTab === "charter" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">1. Input Core Elements</h2>
              <textarea 
                className="w-full h-40 p-4 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-orange-500 text-sm"
                value={coreElements}
                onChange={(e) => setCoreElements(e.target.value)}
              />
              <button 
                onClick={handleGenerateCharter}
                disabled={isGenerating}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:bg-slate-300"
              >
                {isGenerating ? "Generating Detailed Charter..." : "Generate AI Charter"}
              </button>
              
              {charter && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-4 text-slate-800">2. Manual Editor (JSON format)</h2>
                  <p className="text-xs text-slate-500 mb-2">You can manually override any AI-generated field here before submission.</p>
                  <textarea 
                    className="w-full h-96 p-4 border border-orange-300 rounded-xl mb-4 font-mono text-xs focus:ring-2 focus:ring-orange-500 bg-orange-50"
                    value={editableCharterText}
                    onChange={handleUpdateCharterEditor}
                  />
                  <div className="flex gap-4">
                    <button onClick={handleDownloadPDF} className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button onClick={handleSubmitCharter} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition-colors">
                      Submit for Approval
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {charter && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 overflow-y-auto max-h-[85vh]">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <h2 className="text-xl font-bold text-slate-800">Document Preview</h2>
                </div>
                
                {/* PDF container */}
                <div ref={charterRef} className="text-sm bg-white p-4">
                  <h1 className="text-2xl font-bold text-center mb-6 border-b-2 border-slate-800 pb-4">{charter.project_name || "Project Charter"}</h1>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 border border-slate-300 p-0">
                    <div className="border-r border-b border-slate-300 p-2"><span className="font-bold text-slate-600">Project Sponsor:</span> {charter.project_sponsor}</div>
                    <div className="border-b border-slate-300 p-2"><span className="font-bold text-slate-600">Project Manager:</span> {charter.project_manager}</div>
                    <div className="border-r border-slate-300 p-2"><span className="font-bold text-slate-600">Approval Date:</span> {charter.date_of_project_approval}</div>
                    <div className="p-2"><span className="font-bold text-slate-600">Last Revision:</span> {charter.last_revision_date}</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div><h3 className="font-bold text-lg text-slate-800 border-b border-slate-200">Project Description</h3><div className="mt-1"><RenderField data={charter.project_description} /></div></div>
                    <div><h3 className="font-bold text-lg text-slate-800 border-b border-slate-200">Scope</h3><div className="mt-1"><RenderField data={charter.scope} /></div></div>
                    <div><h3 className="font-bold text-lg text-slate-800 border-b border-slate-200">Business Case</h3><div className="mt-1"><RenderField data={charter.business_case} /></div></div>
                    <div><h3 className="font-bold text-lg text-slate-800 border-b border-slate-200">Constraints</h3><div className="mt-1"><RenderField data={charter.constraints} /></div></div>
                    <div><h3 className="font-bold text-lg text-slate-800 border-b border-slate-200">Project Deliverables</h3><div className="mt-1"><RenderField data={charter.project_deliverables} /></div></div>
                    <div><h3 className="font-bold text-lg text-slate-800 border-b border-slate-200">Benefits & KPIs</h3><div className="mt-1"><RenderField data={charter.benefits} /></div></div>
                    <div><h3 className="font-bold text-lg text-slate-800 border-b border-slate-200">Steering Committee</h3><div className="mt-1"><RenderField data={charter.steering_committee} /></div></div>
                    <div><h3 className="font-bold text-lg text-slate-800 border-b border-slate-200">Key Stakeholders</h3><div className="mt-1"><RenderField data={charter.key_stakeholders} /></div></div>
                    <div><h3 className="font-bold text-lg text-slate-800 border-b border-slate-200">Risks</h3><div className="mt-1"><RenderField data={charter.risks} /></div></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "procurement" && (
          <div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Product Requirements</h2>
                <button 
                  onClick={handleAutoSuggestProcurement}
                  disabled={isSuggesting}
                  className="text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 py-1 px-3 rounded-lg font-medium transition"
                >
                  {isSuggesting ? "Reading Charter..." : "AI Auto-Suggest from Charter"}
                </button>
              </div>
              <textarea 
                className="w-full h-32 p-4 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-orange-500"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="List required items here, or click Auto-Suggest to read from the approved project charter."
              />
              <button 
                onClick={handleSourceProcurement}
                disabled={isSourcing}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:bg-slate-300"
              >
                {isSourcing ? "Agent searching web & emailing..." : "Start Procurement Agent"}
              </button>
            </div>

            {quotes.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                {quotes.map((q, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    {idx === 0 && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">BEST DEAL</div>}
                    <h3 className="font-bold text-lg mb-2">{q.vendor_name}</h3>
                    <p className="text-3xl font-bold text-orange-600 mb-4">₹{q.amount}</p>
                    <p className="text-sm text-slate-600 mb-4">{q.details}</p>
                    <a href={`mailto:${q.contact_email}`} className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                      Contact: {q.contact_email} <ArrowRight className="w-3 h-3"/>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "dispatch" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">Define Tasks (One per line)</h2>
              <textarea 
                className="w-full h-40 p-4 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-orange-500"
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
              />
              <button 
                onClick={handleAssignDispatch}
                disabled={isAssigning}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:bg-slate-300"
              >
                {isAssigning ? "Matching Agents..." : "Assign Field Volunteers"}
              </button>
            </div>
            
            {assignments.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">AI Agent Assignments</h2>
                <div className="space-y-3">
                  {assignments.map((a, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50">
                      <div>
                        <p className="font-semibold text-slate-900">{a.agent_name}</p>
                        <p className="text-sm text-slate-600">{a.task_desc}</p>
                      </div>
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-md font-medium">Assigned</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "task-review" && (
          <div className="max-w-4xl">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Field Operations Review</h2>
            {pendingTasks.length === 0 ? (
              <p className="text-slate-500">No tasks currently pending approval.</p>
            ) : (
              <div className="space-y-6">
                {pendingTasks.map((task, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-slate-900">{task.task_desc}</h3>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-bold">Pending Review</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">Agent: <strong>{task.agent_name}</strong></p>
                      
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-1">Field Notes</p>
                        <p className="text-slate-800 italic">"{task.completion_notes}"</p>
                      </div>
                      
                      {task.photo_url && (
                        <div className="mb-4">
                          <p className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-2">Photo Evidence</p>
                          <img src={task.photo_url} alt="Proof" className="h-32 w-auto rounded-lg border border-slate-200" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-center gap-3 md:w-48 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                      <button 
                        onClick={() => handleTaskAction(task.task_id, "approve")}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl transition"
                      >
                        Approve Task
                      </button>
                      <button 
                        onClick={() => handleTaskAction(task.task_id, "reject")}
                        className="w-full bg-white border border-red-300 text-red-600 hover:bg-red-50 font-medium py-3 rounded-xl transition"
                      >
                        Reject & Return
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
