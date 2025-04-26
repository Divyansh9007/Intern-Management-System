import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { FileText, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const { interns, tasks, performances, generateReport } = useApp();
  const [reportType, setReportType] = useState('performance');
  const [timePeriod, setTimePeriod] = useState('month');
  const [reportData, setReportData] = useState(null);

  // Calculate monthly task completion data
  const getMonthlyTaskData = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];
    return months.map(month => {
      return tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate.toLocaleString('default', { month: 'long' }) === month && task.status === 'Completed';
      }).length;
    });
  };

  // Calculate average performance ratings by month
  const getMonthlyPerformanceData = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];
    return months.map(month => {
      const monthlyReviews = performances.filter(perf => {
        const reviewDate = new Date(perf.lastReview);
        return reviewDate.toLocaleString('default', { month: 'long' }) === month;
      });
      if (monthlyReviews.length === 0) return 0;
      const average = monthlyReviews.reduce((acc, curr) => acc + curr.rating, 0) / monthlyReviews.length;
      return Number(average.toFixed(2));
    });
  };

  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: getMonthlyTaskData(),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
      {
        label: 'Average Performance Rating',
        data: getMonthlyPerformanceData(),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const generatePDFReport = () => {
    const filteredData = generateReport(reportType, timePeriod);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Period: ${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 40, { align: 'center' });

    // Report content based on type
    switch (reportType) {
      case 'performance':
        doc.autoTable({
          startY: 50,
          head: [['Intern Name', 'Rating', 'Tasks Completed', 'Review Date', 'Feedback']],
          body: filteredData.map(perf => {
            const intern = interns.find(i => i.id === perf.internId);
            return [
              intern?.name || 'Unknown',
              perf.rating.toString(),
              perf.tasksCompleted.toString(),
              perf.lastReview,
              perf.feedback
            ];
          }),
        });
        break;

      case 'task':
        doc.autoTable({
          startY: 50,
          head: [['Title', 'Assigned To', 'Status', 'Priority', 'Deadline']],
          body: filteredData.map(task => [
            task.title,
            task.assignedTo,
            task.status,
            task.priority,
            task.deadline
          ]),
        });
        break;

      case 'attendance':
        doc.autoTable({
          startY: 50,
          head: [['Name', 'Role', 'Join Date', 'Status']],
          body: filteredData.map(intern => [
            intern.name,
            intern.role,
            intern.joinDate,
            intern.status
          ]),
        });
        break;
    }

    // Save the PDF
    doc.save(`${reportType}-report-${timePeriod}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleGenerateReport = () => {
    const data = generateReport(reportType, timePeriod);
    setReportData(data);
    generatePDFReport();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={handleGenerateReport}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <FileText className="h-5 w-5 mr-2" />
          Generate PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Trends</h2>
          <Bar data={chartData} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Report Summary</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Total Interns</h3>
              <p className="text-2xl font-bold text-indigo-600 mt-2">{interns.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Completed Tasks</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {tasks.filter(t => t.status === 'Completed').length}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Average Performance</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {performances.length > 0
                  ? (performances.reduce((acc, curr) => acc + curr.rating, 0) / performances.length).toFixed(2)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Report Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Report Type</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="performance">Performance Report</option>
              <option value="task">Task Completion Report</option>
              <option value="attendance">Attendance Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Period</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;