"use client";

import { useState, useRef } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Spinner from "@/components/ui/Spinner";
import type { StudentResult } from "@/types";

interface ResultPortalProps {
  schoolName: string;
  schoolAddress: string;
}

const totalMarks = (subjects: StudentResult["subjects"]) => subjects.reduce((s, sub) => s + sub.fullMarks, 0);
const totalObtained = (subjects: StudentResult["subjects"]) => subjects.reduce((s, sub) => s + sub.obtained, 0);

export default function ResultPortal({ schoolName, schoolAddress }: ResultPortalProps) {
  const [symbolNumber, setSymbolNumber] = useState("");
  const [dob, setDob] = useState("");
  const [result, setResult] = useState<StudentResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const marksheetRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!symbolNumber.trim() || !dob.trim()) { setError("Please enter both Symbol Number and Date of Birth."); return; }
    setLoading(true);
    try {
      const res = await fetch("/data/results.json");
      const data: StudentResult[] = await res.json();
      const found = data.find((r) => r.symbolNumber.toLowerCase() === symbolNumber.trim().toLowerCase() && r.dob === dob.trim());
      if (found) setResult(found); else setError("No result found. Please check your Symbol Number and Date of Birth.");
    } catch { setError("Error fetching results. Please try again later."); }
    finally { setLoading(false); }
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-border p-6 lg:p-8 mb-8">
        <SectionHeading title="Student Result Portal" />

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Symbol Number <span className="text-accent">*</span></label>
              <input type="text" value={symbolNumber} onChange={(e) => setSymbolNumber(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="e.g. 083001" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Date of Birth <span className="text-accent">*</span></label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" />
            </div>
          </div>
          {error && <div className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded-lg p-3 text-accent text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2">
            {loading ? <><Spinner /> Searching...</> : "View Result"}
          </button>
        </form>
      </div>

      {result && (
        <>
          <style jsx>{`
            @media print { body * { visibility: hidden; } .marksheet-print, .marksheet-print * { visibility: visible; } .marksheet-print { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; } .no-print { display: none !important; } @page { margin: 15mm; } }
          `}</style>

          <div className="marksheet-print" ref={marksheetRef}>
            <div className="bg-white rounded-2xl shadow-xl border-2 border-primary overflow-hidden">
              <div className="bg-primary px-6 lg:px-10 py-6 text-center">
                <h2 className="text-xl lg:text-2xl font-heading font-bold text-white">{schoolName}</h2>
                <p className="text-gray-200 text-xs mt-1">{schoolAddress}</p>
                <div className="mt-4 inline-block bg-secondary/20 border border-secondary/40 rounded-lg px-6 py-2">
                  <p className="text-secondary font-heading font-bold text-lg">Academic Marksheet</p>
                  <p className="text-gray-200 text-xs">{result.exam}</p>
                </div>
              </div>

              <div className="px-6 lg:px-10 py-5 border-b border-border bg-surface">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted text-xs block">Student Name</span><strong>{result.studentName}</strong></div>
                  <div><span className="text-muted text-xs block">Class</span><strong>{result.class}</strong></div>
                  <div><span className="text-muted text-xs block">Symbol Number</span><strong>{result.symbolNumber}</strong></div>
                  <div><span className="text-muted text-xs block">Date of Birth</span><strong>{result.dob}</strong></div>
                </div>
              </div>

              <div className="px-4 lg:px-8 py-6">
                <h3 className="text-sm font-heading font-bold text-primary uppercase tracking-wider mb-4">Subject-wise Performance</h3>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-primary text-white"><th className="p-3 text-left font-semibold rounded-tl-lg">Subject</th><th className="p-3 text-center font-semibold">Full Marks</th><th className="p-3 text-center font-semibold">Pass Marks</th><th className="p-3 text-center font-semibold">Obtained</th><th className="p-3 text-center font-semibold rounded-tr-lg">Result</th></tr></thead>
                    <tbody>
                      {result.subjects.map((s, i) => {
                        const passed = s.obtained >= s.passMarks;
                        return (
                          <tr key={i} className={i % 2 === 0 ? "bg-surface/50" : "bg-white"}>
                            <td className="p-3 font-medium text-foreground">{s.name}</td>
                            <td className="p-3 text-center text-muted">{s.fullMarks}</td>
                            <td className="p-3 text-center text-muted">{s.passMarks}</td>
                            <td className="p-3 text-center font-bold"><span className={passed ? "text-primary" : "text-accent"}>{s.obtained}</span></td>
                            <td className="p-3 text-center">
                              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>{passed ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}</svg>
                                {passed ? "Pass" : "Fail"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-4 lg:px-8 pb-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-surface rounded-xl p-4 text-center border border-border"><p className="text-xs text-muted mb-1">Total Marks</p><p className="text-xl font-bold text-foreground">{totalMarks(result.subjects)}</p></div>
                  <div className="bg-surface rounded-xl p-4 text-center border border-border"><p className="text-xs text-muted mb-1">Obtained</p><p className="text-xl font-bold text-primary">{totalObtained(result.subjects)}</p></div>
                  <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/20"><p className="text-xs text-muted mb-1">Percentage</p><p className="text-xl font-bold text-primary">{result.percentage}%</p></div>
                  <div className="bg-surface rounded-xl p-4 text-center border border-border"><p className="text-xs text-muted mb-1">Division / Rank</p><p className="text-lg font-bold text-foreground">{result.division}</p><p className="text-xs text-muted">Rank: {result.rank}</p></div>
                </div>
              </div>

              <div className="px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">Final Result:</span>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full ${result.result === "Pass" ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}>
                    {result.result === "Pass" ? "PASSED" : "FAILED"}
                  </span>
                </div>
                <button onClick={handlePrint} className="no-print inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Print / Download PDF
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
