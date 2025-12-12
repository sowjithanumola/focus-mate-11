import React, { useState, useMemo, useEffect } from 'react';
import { DailyEntry, AIAnalysis, ChartDataPoint } from '../types';
import { getEntriesByMonth } from '../services/storageService';
import { analyzeProgress } from '../services/geminiService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend
} from 'recharts';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = getEntriesByMonth(currentDate.getFullYear(), currentDate.getMonth());
    // Sort by date ascending
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEntries(data);
    setAnalysis(null); // Reset analysis when month changes
    setError(null);
  }, [currentDate]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    return entries.map(e => ({
      day: new Date(e.date).getDate().toString(),
      duration: e.durationMinutes,
      focus: e.focusLevel
    }));
  }, [entries]);

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const generateReport = async () => {
    if (entries.length === 0) {
      setError("Not enough data to generate a report. Add some logs first!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeProgress(entries);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("API Key")) {
        setError("Missing API Key. Please configure your environment variables.");
      } else {
        setError("Failed to generate AI report. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Monthly Progress</h2>
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
          <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-slate-100 rounded">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <span className="text-sm font-medium w-32 text-center">{monthName}</span>
          <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-slate-100 rounded">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
          <p className="text-slate-400">No entries found for this month.</p>
        </div>
      ) : (
        <>
          {/* Chart Section */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 h-80">
            <h3 className="text-sm font-medium text-slate-500 mb-4">Duration & Focus Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar yAxisId="left" dataKey="duration" name="Minutes" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="focus" name="Focus Level" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* AI Section */}
          <div className="space-y-4">
            {!analysis && !loading && (
              <button
                onClick={generateReport}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-5 h-5" />
                Analyze My Performance
              </button>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 text-primary-600">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium animate-pulse">Consulting FocusMate AI...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            {analysis && (
              <div className="space-y-4 animate-slide-up">
                {/* Summary Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500" /> Monthly Summary
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{analysis.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Trends */}
                  <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Observed Patterns
                    </h3>
                    <ul className="space-y-2">
                      {analysis.trends.map((item, idx) => (
                        <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="block w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mistakes */}
                  <div className="bg-amber-50/50 rounded-xl border border-amber-100 p-5">
                    <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Areas for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {analysis.mistakes.map((item, idx) => (
                        <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                          <span className="block w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-5">
                  <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Suggestions for Next Month
                  </h3>
                  <div className="grid gap-3">
                    {analysis.suggestions.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-indigo-100 text-sm text-indigo-800 shadow-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};