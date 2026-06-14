"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Receipt, BookOpen, CalendarDays, FileText, Upload, CheckCircle2, AlertCircle, Calculator } from "lucide-react";

export default function AccountantDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("processing");
  const [ledger, setLedger] = useState<any[]>([]);
  const [dailyCash, setDailyCash] = useState<any[]>([]);
  
  // Bill Processing State
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (activeTab === "ledger") fetchLedger();
    if (activeTab === "daily") fetchDailyCash();
  }, [activeTab]);

  const fetchLedger = async () => {
    try {
      const res = await fetch("https://ngo-fjwc.vercel.app/api/v1/finance/ledger");
      const data = await res.json();
      setLedger(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDailyCash = async () => {
    try {
      const res = await fetch("https://ngo-fjwc.vercel.app/api/v1/finance/daily-cash");
      const data = await res.json();
      setDailyCash(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setOcrData(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://ngo-fjwc.vercel.app/api/v1/finance/upload-receipt", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setOcrData(data);
    } catch (e) {
      console.error(e);
      alert("Error scanning receipt");
    } finally {
      setIsScanning(false);
    }
  };

  const handleApprove = async () => {
    if (!ocrData) return;
    setIsApproving(true);
    try {
      await fetch("https://ngo-fjwc.vercel.app/api/v1/finance/approve-po", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ocrData),
      });
      alert("Added to General Ledger successfully!");
      setFile(null);
      setPreview(null);
      setOcrData(null);
    } catch (e) {
      console.error(e);
      alert("Error approving receipt");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadAudit = () => {
    window.open("https://ngo-fjwc.vercel.app/api/v1/finance/audit-report", "_blank");
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/accountant-login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold">Accounting</h2>
              <p className="text-xs text-slate-400">Priya (Chief Acct)</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab("processing")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "processing" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
            <Receipt className="w-5 h-5" /> Bill Processing
          </button>
          <button onClick={() => setActiveTab("ledger")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "ledger" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
            <BookOpen className="w-5 h-5" /> General Ledger
          </button>
          <button onClick={() => setActiveTab("daily")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "daily" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
            <CalendarDays className="w-5 h-5" /> Daily Cash Book
          </button>
          <button onClick={() => setActiveTab("audit")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "audit" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
            <FileText className="w-5 h-5" /> Audit & Tax (10B)
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

        {activeTab === "processing" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">Upload Vendor Bill</h2>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer relative">
                <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Drop receipt or click to upload</p>
              </div>
              
              {preview && (
                <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
                  <img src={preview} alt="Preview" className="w-full h-64 object-contain bg-slate-100" />
                </div>
              )}

              <button 
                onClick={handleScan}
                disabled={!file || isScanning}
                className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl disabled:bg-slate-300 transition-colors flex justify-center items-center gap-2"
              >
                {isScanning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Run AI Extractor"}
              </button>
            </div>

            {ocrData && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-200">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <h2 className="text-lg font-semibold text-slate-800">AI Extracted Data</h2>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Vendor Name</p>
                    <p className="font-semibold text-slate-900">{ocrData.vendor_name}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Tax ID / GST</p>
                    <p className="font-semibold text-slate-900">{ocrData.tax_id}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-sm text-purple-600 mb-1">Total Amount (INR)</p>
                    <p className="text-2xl font-bold text-purple-700">₹{ocrData.total_amount}</p>
                  </div>
                  {ocrData.receipt_url && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-500 mb-1">Proof Stored At</p>
                      <a href={ocrData.receipt_url} target="_blank" className="text-blue-500 text-sm truncate block hover:underline">{ocrData.receipt_url}</a>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl disabled:bg-purple-300 transition-colors"
                >
                  {isApproving ? "Approving..." : "Approve & Post to Ledger"}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Date & Time</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Type</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">Amount (INR)</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${entry.event_type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {entry.event_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-900 text-right">
                      ₹{entry.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {entry.receipt_storage_url ? (
                        <a href={entry.receipt_storage_url} target="_blank" className="text-blue-500 hover:underline">View Receipt</a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-500">No ledger entries found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "daily" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Date</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-green-600">Total Credits</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-red-600">Total Debits</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-900">Net Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyCash.map((day, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{day.date}</td>
                    <td className="py-4 px-6 text-sm text-right text-green-600">₹{day.credits.toLocaleString()}</td>
                    <td className="py-4 px-6 text-sm text-right text-red-600">₹{day.debits.toLocaleString()}</td>
                    <td className={`py-4 px-6 text-sm font-bold text-right ${day.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{day.net.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {dailyCash.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-500">No daily cash records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Statutory Audit Generator</h2>
                <p className="text-slate-500">Generate Form 10B/10BB layout for Indian Income Tax compliance.</p>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
              <h3 className="font-semibold text-slate-800 mb-2">What's included?</h3>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                <li>Receipts and Payments Account aggregate</li>
                <li>Income and Expenditure Account summary</li>
                <li>Timestamped auditor verification block</li>
              </ul>
            </div>
            <button 
              onClick={handleDownloadAudit}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              <FileText className="w-5 h-5" /> Generate & View Form 10B
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
