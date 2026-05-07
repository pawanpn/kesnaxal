"use client";

import { useState, useRef } from "react";
import { siteData } from "@/config/siteData";

interface Subject {
  name: string;
  fullMarks: number;
  passMarks: number;
  obtained: number;
}

interface Result {
  symbolNumber: string;
  studentName: string;
  class: string;
  dob: string;
  exam: string;
  subjects: Subject[];
  result: string;
  division: string;
  percentage: number;
  rank: number;
}

export default function ResultPortal() {
  const [symbolNumber, setSymbolNumber] = useState("");
  const [dob, setDob] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const marksheetRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!symbolNumber.trim() || !dob.trim()) {
      setError("Please enter both Symbol Number and Date of Birth.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/data/results.json");
      const data: Result[] = await res.json();
      const found = data.find(
        (r) =>
          r.symbolNumber.toLowerCase() === symbolNumber.trim().toLowerCase() &&
          r.dob === dob.trim()
      );
      if (found) {
        setResult(found);
      } else {
        setError("No result found. Please check your Symbol Number and Date of Birth.");
      }
    } catch {
      setError("Error fetching results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!marksheetRef.current) return;

    const content = marksheetRef.current.innerHTML;
    const styles = getComputedStyle(document.documentElement);

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${result?.studentName} - Marksheet</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            color: #171717;
            padding: 30px;
            max-width: 700px;
            margin: auto;
          }
          .marksheet {
            border: 2px solid #0056b3;
            padding: 24px;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0056b3;
            padding-bottom: 16px;
            margin-bottom: 16px;
          }
          .header h2 { color: #0056b3; margin: 0; font-size: 22px; }
          .header p { color: #6b7280; margin: 4px 0; font-size: 13px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 16px; }
          .info-grid span { color: #6b7280; }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            background: #0056b3;
            color: white;
            padding: 8px 10px;
            text-align: left;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-top: 16px;
            text-align: center;
          }
          .summary-item {
            padding: 10px;
            border-radius: 6px;
            background: #f3f4f6;
          }
          .summary-item .label { font-size: 10px; color: #6b7280; }
          .summary-item .value { font-size: 16px; font-weight: 700; margin-top: 4px; }
          .pass { color: #16a34a; } .fail { color: #d22b2b; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const totalMarks = (subjects: Subject[]) =>
    subjects.reduce((sum, s) => sum + s.fullMarks, 0);
  const totalObtained = (subjects: Subject[]) =>
    subjects.reduce((sum, s) => sum + s.obtained, 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-border p-6 lg:p-8 mb-8">
        <h2 className="text-xl font-heading font-bold text-primary mb-6">
          Student Result Portal
        </h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Symbol Number *
              </label>
              <input
                type="text"
                value={symbolNumber}
                onChange={(e) => setSymbolNumber(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                placeholder="e.g. 083001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
              />
            </div>
          </div>
          {error && (
            <p className="text-accent text-sm bg-accent/5 rounded-lg p-3">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Searching..." : "View Result"}
          </button>
        </form>
      </div>

      {result && (
        <div ref={marksheetRef} className="bg-white rounded-2xl shadow-lg border-2 border-primary p-6 lg:p-8">
          <div className="text-center border-b-2 border-primary pb-4 mb-6">
            <h2 className="text-xl lg:text-2xl font-heading font-bold text-primary">
              {siteData.school.name}
            </h2>
            <p className="text-sm text-muted">{siteData.contact.address}</p>
            <p className="text-lg font-heading font-bold text-foreground mt-3">
              {result.exam}
            </p>
            <p className="text-sm text-muted">Academic Marksheet</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-6">
            <div><span className="text-muted">Name:</span> <strong>{result.studentName}</strong></div>
            <div><span className="text-muted">Class:</span> <strong>{result.class}</strong></div>
            <div><span className="text-muted">Symbol No:</span> <strong>{result.symbolNumber}</strong></div>
            <div><span className="text-muted">DOB:</span> <strong>{result.dob}</strong></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-3 text-left rounded-tl-lg">Subject</th>
                  <th className="p-3 text-center">Full Marks</th>
                  <th className="p-3 text-center">Pass Marks</th>
                  <th className="p-3 text-center">Obtained</th>
                  <th className="p-3 text-center rounded-tr-lg">Result</th>
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-surface" : ""}>
                    <td className="p-3">{s.name}</td>
                    <td className="p-3 text-center">{s.fullMarks}</td>
                    <td className="p-3 text-center">{s.passMarks}</td>
                    <td className="p-3 text-center font-semibold">{s.obtained}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          s.obtained >= s.passMarks
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {s.obtained >= s.passMarks ? "Pass" : "Fail"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-xs text-muted">Total Marks</p>
              <p className="text-lg font-bold text-foreground">{totalMarks(result.subjects)}</p>
            </div>
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-xs text-muted">Obtained</p>
              <p className="text-lg font-bold text-foreground">{totalObtained(result.subjects)}</p>
            </div>
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-xs text-muted">Percentage</p>
              <p className="text-lg font-bold text-primary">{result.percentage}%</p>
            </div>
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-xs text-muted">Division</p>
              <p className="text-lg font-bold text-foreground">{result.division}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Final Result:</span>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  result.result === "Pass"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {result.result}
              </span>
              <span className="text-sm text-muted">| Rank: <strong>{result.rank}</strong></span>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors print:hidden"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
