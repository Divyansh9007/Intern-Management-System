import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Users, CheckSquare, Clock, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { interns, tasks, performances } = useApp();

  // Calculate dynamic stats
  const activeInterns = interns.filter(intern => intern.status === 'Active').length;
  const activeTasks = tasks.filter(task => task.status === 'In Progress').length;
  const pendingReviews = interns.length - performances.length;
  const topPerformers = performances
    .filter(perf => perf.rating >= 4.5)
    .length;

  const stats = [
    { title: 'Total Interns', value: activeInterns.toString(), icon: <Users className="h-6 w-6" />, color: 'bg-blue-500' },
    { title: 'Active Tasks', value: activeTasks.toString(), icon: <CheckSquare className="h-6 w-6" />, color: 'bg-green-500' },
    { title: 'Pending Reviews', value: pendingReviews.toString(), icon: <Clock className="h-6 w-6" />, color: 'bg-yellow-500' },
    { title: 'Top Performers', value: topPerformers.toString(), icon: <Award className="h-6 w-6" />, color: 'bg-purple-500' },
  ];

  // Calculate task completion data for the last 4 weeks
  const getWeeklyTaskData = () => {
    const now = new Date();
    const weeks = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      return weekStart;
    }).reverse();

    return weeks.map((weekStart, index) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      return tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate >= weekStart && taskDate < weekEnd && task.status === 'Completed';
      }).length;
    });
  };

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: getWeeklyTaskData(),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  // Get recent activities
  const getRecentActivities = () => {
    const allActivities = [
      ...interns.map(intern => ({
        text: `New intern joined - ${intern.name}`,
        time: intern.joinDate,
        timestamp: new Date(intern.joinDate).getTime()
      })),
      ...tasks.filter(task => task.status === 'Completed').map(task => ({
        text: `Task completed - ${task.title}`,
        time: task.deadline,
        timestamp: new Date(task.deadline).getTime()
      })),
      ...performances.map(perf => {
        const intern = interns.find(i => i.id === perf.internId);
        return {
          text: `Performance review submitted for ${intern?.name}`,
          time: perf.lastReview,
          timestamp: new Date(perf.lastReview).getTime()
        };
      })
    ];

    return allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3)
      .map(activity => ({
        text: activity.text,
        time: new Date(activity.time).toLocaleDateString()
      }));
  };

  // Get upcoming deadlines
  const getUpcomingDeadlines = () => {
    const now = new Date();
    return tasks
      .filter(task => task.status !== 'Completed' && new Date(task.deadline) > now)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3)
      .map(task => ({
        task: task.title,
        deadline: new Date(task.deadline).toLocaleDateString()
      }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-full text-white mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Task Completion Trend</h2>
        <Bar data={chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {getRecentActivities().map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b">
                <p className="text-gray-600">{activity.text}</p>
                <span className="text-sm text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
          <div className="space-y-4">
            {getUpcomingDeadlines().map((deadline, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b">
                <p className="text-gray-600">{deadline.task}</p>
                <span className="text-sm text-red-500">{deadline.deadline}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;