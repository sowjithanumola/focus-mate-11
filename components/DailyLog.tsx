import React, { useState, useEffect } from 'react';
import { DailyEntry } from '../types';
import { saveEntry } from '../services/storageService';
import { Check, Plus, AlertCircle } from 'lucide-react';

interface DailyLogProps {
  onEntrySaved: () => void;
}

export const DailyLog: React.FC<DailyLogProps> = ({ onEntrySaved }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subjects, setSubjects] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [focusLevel, setFocusLevel] = useState(5);
  const [remarks, setRemarks] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Reset success message after 3 seconds
  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => setIsSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || !subjects) return;

    const newEntry: DailyEntry = {
      id: `${date}-${Date.now()}`,
      date,
      subjects,
      durationMinutes: Number(duration),
      focusLevel,
      remarks,
      timestamp: Date.now()
    };

    saveEntry(newEntry);
    setIsSaved(true);
    
    // Clear form but keep date
    setSubjects('');
    setDuration('');
    setFocusLevel(5);
    setRemarks('');
    onEntrySaved();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Daily Log</h2>
        <p className="text-slate-500">Record your progress to build consistency.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {/* Date Selection */}
        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
          />
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          <label htmlFor="subjects" className="block text-sm font-medium text-slate-700">
            Subjects / Topics Covered
          </label>
          <input
            type="text"
            id="subjects"
            required
            placeholder="e.g. Math (Calculus), History (WW2)"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
          />
        </div>

        {/* Duration & Focus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="duration" className="block text-sm font-medium text-slate-700">
              Time Spent (minutes)
            </label>
            <input
              type="number"
              id="duration"
              required
              min="1"
              placeholder="60"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="focus" className="block text-sm font-medium text-slate-700">
                Focus Level
              </label>
              <span className={`text-sm font-bold ${focusLevel >= 8 ? 'text-green-600' : focusLevel >= 5 ? 'text-yellow-600' : 'text-red-500'}`}>
                {focusLevel}/10
              </span>
            </div>
            <input
              type="range"
              id="focus"
              min="1"
              max="10"
              value={focusLevel}
              onChange={(e) => setFocusLevel(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-xs text-slate-400 px-1">
              <span>Distracted</span>
              <span>Flow State</span>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="space-y-2">
          <label htmlFor="remarks" className="block text-sm font-medium text-slate-700">
            Daily Remarks
          </label>
          <div className="relative">
            <textarea
              id="remarks"
              rows={4}
              placeholder="What went well? What distracted you? Plan for tomorrow..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none"
            />
            <div className="absolute top-3 right-3 text-slate-300">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Being honest here helps the AI give better advice later.</p>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-primary-500/30 active:scale-[0.98] ${
              isSaved ? 'bg-green-600' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-5 h-5" /> Saved Successfully!
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" /> Add Log Entry
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
