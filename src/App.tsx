import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Plus, X } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
}

interface DayRecord {
  date: string;
  completedHabits: string[];
  highlight?: string;
}

// Keys for localStorage
const STORAGE_KEYS = {
  HABITS: 'habit-tracker-habits',
  RECORDS: 'habit-tracker-records',
};

function App() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const savedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
    return savedHabits ? JSON.parse(savedHabits) : [
      { id: '1', name: 'Morning Run' },
      { id: '2', name: 'Read 30 mins' },
      { id: '3', name: 'Meditate' },
      { id: '4', name: 'Drink Water' },
    ];
  });

  const [records, setRecords] = useState<DayRecord[]>(() => {
    const savedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return savedRecords ? JSON.parse(savedRecords) : [];
  });

  const [newHabit, setNewHabit] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  // Save records to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }, [records]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const formatDate = (day: number) => {
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const toggleHabit = (habitId: string, day: number) => {
    const dateStr = formatDate(day);
    setRecords(prev => {
      const existingRecord = prev.find(r => r.date === dateStr);
      if (existingRecord) {
        const newCompletedHabits = existingRecord.completedHabits.includes(habitId)
          ? existingRecord.completedHabits.filter(id => id !== habitId)
          : [...existingRecord.completedHabits, habitId];
        return prev.map(r =>
          r.date === dateStr
            ? { ...r, completedHabits: newCompletedHabits }
            : r
        );
      }
      return [...prev, { date: dateStr, completedHabits: [habitId] }];
    });
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits(prev => [...prev, { id: Date.now().toString(), name: newHabit.trim() }]);
      setNewHabit('');
    }
  };

  const removeHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    // Clean up records for the removed habit
    setRecords(prev => prev.map(record => ({
      ...record,
      completedHabits: record.completedHabits.filter(id => id !== habitId)
    })));
  };

  const updateHighlight = (day: number, highlight: string) => {
    const dateStr = formatDate(day);
    setRecords(prev => {
      const existingRecord = prev.find(r => r.date === dateStr);
      if (existingRecord) {
        return prev.map(r =>
          r.date === dateStr
            ? { ...r, highlight }
            : r
        );
      }
      return [...prev, { date: dateStr, completedHabits: [], highlight }];
    });
  };

  const getRecord = (day: number) => {
    return records.find(r => r.date === formatDate(day));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Add new habit..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={addHabit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Habit
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b w-16 text-center">Day</th>
                {habits.map(habit => (
                  <th key={habit.id} className="px-4 py-2 border-b">
                    <div className="flex items-center justify-between gap-2">
                      <span>{habit.name}</span>
                      <button
                        onClick={() => removeHabit(habit.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-2 border-b w-64">Highlights</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: getDaysInMonth(selectedDate) }, (_, i) => i + 1).map(day => (
                <tr key={day} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b text-center font-medium">{day}</td>
                  {habits.map(habit => (
                    <td key={habit.id} className="px-4 py-2 border-b text-center">
                      <button
                        onClick={() => toggleHabit(habit.id, day)}
                        className={`w-6 h-6 rounded ${
                          getRecord(day)?.completedHabits.includes(habit.id)
                            ? 'text-green-500 hover:text-green-700'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      >
                        <CheckSquare className="w-full h-full" />
                      </button>
                    </td>
                  ))}
                  <td className="px-4 py-2 border-b">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={getRecord(day)?.highlight || ''}
                        onChange={(e) => updateHighlight(day, e.target.value)}
                        placeholder="Add highlight..."
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
