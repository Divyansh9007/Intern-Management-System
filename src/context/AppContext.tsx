import React, { createContext, useContext, useState, useEffect } from 'react';

interface Intern {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  role: string;
  joinDate: string;
  status: string;
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  deadline: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
}

interface Performance {
  id: string;
  internId: string;
  rating: number;
  tasksCompleted: number;
  lastReview: string;
  feedback: string;
}

interface Attendance {
  id: string;
  internId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

interface AppContextType {
  interns: Intern[];
  tasks: Task[];
  performances: Performance[];
  attendance: Attendance[];
  addIntern: (intern: Omit<Intern, 'id' | 'status' | 'joinDate'>) => void;
  updateIntern: (id: string, intern: Partial<Intern>) => void;
  deleteIntern: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  addPerformanceReview: (review: Omit<Performance, 'id'>) => void;
  updatePerformanceReview: (id: string, review: Partial<Performance>) => void;
  deletePerformanceReview: (id: string) => void;
  addAttendance: (attendance: Omit<Attendance, 'id'>) => void;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => void;
  deleteAttendance: (id: string) => void;
  getInternAttendance: (internId: string) => Attendance[];
  generateReport: (type: string, period: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Load data from localStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interns, setInterns] = useState<Intern[]>(() => 
    loadFromStorage('interns', [
      {
        id: '1',
        name: 'Sarah Parker',
        email: 'sarah.parker@example.com',
        phone: '123-456-7890',
        skills: ['React', 'TypeScript', 'CSS'],
        role: 'Frontend Developer',
        joinDate: '2024-01-15',
        status: 'Active',
      },
    ])
  );

  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage('tasks', [
      {
        id: '1',
        title: 'Complete React Tutorial',
        assignedTo: 'Sarah Parker',
        deadline: '2024-03-20',
        status: 'In Progress',
        priority: 'High',
      },
    ])
  );

  const [performances, setPerformances] = useState<Performance[]>(() =>
    loadFromStorage('performances', [
      {
        id: '1',
        internId: '1',
        rating: 4.5,
        tasksCompleted: 15,
        lastReview: '2024-03-01',
        feedback: 'Excellent progress in React development. Shows great initiative.',
      },
    ])
  );

  const [attendance, setAttendance] = useState<Attendance[]>(() =>
    loadFromStorage('attendance', [
      {
        id: '1',
        internId: '1',
        date: '2024-03-18',
        status: 'Present',
        checkIn: '09:00',
        checkOut: '17:00',
      },
    ])
  );

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('interns', JSON.stringify(interns));
  }, [interns]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('performances', JSON.stringify(performances));
  }, [performances]);

  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [attendance]);

  const addIntern = (internData: Omit<Intern, 'id' | 'status' | 'joinDate'>) => {
    const newIntern: Intern = {
      id: Date.now().toString(),
      ...internData,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
    };
    setInterns([...interns, newIntern]);
  };

  const updateIntern = (id: string, internData: Partial<Intern>) => {
    setInterns(interns.map(intern =>
      intern.id === id ? { ...intern, ...internData } : intern
    ));
  };

  const deleteIntern = (id: string) => {
    setInterns(interns.filter(intern => intern.id !== id));
    // Also delete related tasks and performances
    setTasks(tasks.filter(task => task.assignedTo !== interns.find(i => i.id === id)?.name));
    setPerformances(performances.filter(perf => perf.internId !== id));
    setAttendance(attendance.filter(att => att.internId !== id));
  };

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, ...taskData } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const addPerformanceReview = (reviewData: Omit<Performance, 'id'>) => {
    const newReview: Performance = {
      id: Date.now().toString(),
      ...reviewData,
    };
    setPerformances([...performances, newReview]);
  };

  const updatePerformanceReview = (id: string, reviewData: Partial<Performance>) => {
    setPerformances(performances.map(review =>
      review.id === id ? { ...review, ...reviewData } : review
    ));
  };

  const deletePerformanceReview = (id: string) => {
    setPerformances(performances.filter(review => review.id !== id));
  };

  const addAttendance = (attendanceData: Omit<Attendance, 'id'>) => {
    const newAttendance: Attendance = {
      id: Date.now().toString(),
      ...attendanceData,
    };
    setAttendance([...attendance, newAttendance]);
  };

  const updateAttendance = (id: string, attendanceData: Partial<Attendance>) => {
    setAttendance(attendance.map(record =>
      record.id === id ? { ...record, ...attendanceData } : record
    ));
  };

  const deleteAttendance = (id: string) => {
    setAttendance(attendance.filter(record => record.id !== id));
  };

  const getInternAttendance = (internId: string) => {
    return attendance.filter(record => record.internId === internId);
  };

  const generateReport = (type: string, period: string) => {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate = new Date(0); // All time
    }

    let filteredData;
    switch (type) {
      case 'performance':
        filteredData = performances.filter(p => new Date(p.lastReview) >= startDate);
        break;
      case 'task':
        filteredData = tasks.filter(t => new Date(t.deadline) >= startDate);
        break;
      case 'attendance':
        filteredData = attendance.filter(a => new Date(a.date) >= startDate);
        break;
      default:
        filteredData = [];
    }

    return filteredData;
  };

  return (
    <AppContext.Provider value={{
      interns,
      tasks,
      performances,
      attendance,
      addIntern,
      updateIntern,
      deleteIntern,
      addTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      addPerformanceReview,
      updatePerformanceReview,
      deletePerformanceReview,
      addAttendance,
      updateAttendance,
      deleteAttendance,
      getInternAttendance,
      generateReport,
    }}>
      {children}
    </AppContext.Provider>
  );
};