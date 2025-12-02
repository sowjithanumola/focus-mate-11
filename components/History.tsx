import React, { useState, useEffect } from 'react';
import { DailyEntry } from '../types';
import { getEntries, deleteEntry } from '../services/storageService';
import { Trash2, Calendar, Clock, Zap } from 'lucide-react';

export const History: React.FC = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);

  const loadEntries = () => {
    const data = getEntries();
    // Sort descending by timestamp
    data.sort((a, b) => b.timestamp - a.timestamp);
    setEntries(data);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteEntry(id);
      loadEntries();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">History Log</h2>
        <p className="text-slate-500">Review your past study sessions.</p>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No logs found yet.</div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <button 
                  onClick={() => handleDelete(entry.id)}
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-3">{entry.subjects}</h3>

              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                  <Clock className="w-4 h-4 text-primary-500" />
                  {entry.durationMinutes} mins
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                  <Zap className={`w-4 h-4 ${entry.focusLevel >= 7 ? 'text-green-500' : 'text-yellow-500'}`} />
                  Focus: {entry.focusLevel}/10
                </div>
              </div>

              {entry.remarks && (
                <div className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                  "{entry.remarks}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
