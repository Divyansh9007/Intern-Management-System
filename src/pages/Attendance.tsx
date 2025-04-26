import React, { useState } from 'react';
import { Calendar, Clock, UserCheck, AlertCircle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const Attendance = () => {
  const { interns, attendance, addAttendance, updateAttendance } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedIntern, setSelectedIntern] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'Half Day' | 'Leave'>('Present');
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('17:00');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if attendance already exists for this intern on this date
    const existingAttendance = attendance.find(
      a => a.internId === selectedIntern && a.date === selectedDate
    );

    if (existingAttendance) {
      updateAttendance(existingAttendance.id, {
        status: attendanceStatus,
        checkIn: attendanceStatus === 'Present' ? checkIn : undefined,
        checkOut: attendanceStatus === 'Present' ? checkOut : undefined,
        notes,
      });
      toast.success('Attendance updated successfully!');
    } else {
      addAttendance({
        internId: selectedIntern,
        date: selectedDate,
        status: attendanceStatus,
        checkIn: attendanceStatus === 'Present' ? checkIn : undefined,
        checkOut: attendanceStatus === 'Present' ? checkOut : undefined,
        notes,
      });
      toast.success('Attendance marked successfully!');
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedIntern('');
    setAttendanceStatus('Present');
    setCheckIn('09:00');
    setCheckOut('17:00');
    setNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Half Day':
        return 'bg-yellow-100 text-yellow-800';
      case 'Leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStats = (internId: string) => {
    const internAttendance = attendance.filter(a => a.internId === internId);
    const total = internAttendance.length;
    const present = internAttendance.filter(a => a.status === 'Present').length;
    const absent = internAttendance.filter(a => a.status === 'Absent').length;
    const halfDay = internAttendance.filter(a => a.status === 'Half Day').length;
    const leave = internAttendance.filter(a => a.status === 'Leave').length;

    return {
      total,
      present,
      absent,
      halfDay,
      leave,
      percentage: total > 0 ? ((present + (halfDay * 0.5)) / total * 100).toFixed(1) : '0',
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage intern attendance</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          <UserCheck className="h-5 w-5 mr-2" />
          Mark Attendance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interns.map((intern) => {
          const stats = getAttendanceStats(intern.id);
          return (
            <div key={intern.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{intern.name}</h3>
                  <p className="text-sm text-gray-500">{intern.role}</p>
                </div>
                <div className={`px-3 py-1 rounded-full ${
                  Number(stats.percentage) >= 90 ? 'bg-green-100 text-green-800' :
                  Number(stats.percentage) >= 75 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {stats.percentage}% Present
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">Present</p>
                  <p className="text-2xl font-semibold text-green-700">{stats.present}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-600">Absent</p>
                  <p className="text-2xl font-semibold text-red-700">{stats.absent}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-600">Half Day</p>
                  <p className="text-2xl font-semibold text-yellow-700">{stats.halfDay}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Leave</p>
                  <p className="text-2xl font-semibold text-blue-700">{stats.leave}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Attendance</h4>
                <div className="space-y-2">
                  {attendance
                    .filter(a => a.internId === intern.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 3)
                    .map(record => (
                      <div key={record.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{record.date}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mark Attendance Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Mark Attendance
                  </Dialog.Title>
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Intern</label>
                      <select
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={selectedIntern}
                        onChange={(e) => setSelectedIntern(e.target.value)}
                      >
                        <option value="">Select Intern</option>
                        {interns.map((intern) => (
                          <option key={intern.id} value={intern.id}>
                            {intern.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={attendanceStatus}
                        onChange={(e) => setAttendanceStatus(e.target.value as 'Present' | 'Absent' | 'Half Day' | 'Leave')}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Half Day">Half Day</option>
                        <option value="Leave">Leave</option>
                      </select>
                    </div>
                    {attendanceStatus === 'Present' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Check In</label>
                          <input
                            type="time"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Check Out</label>
                          <input
                            type="time"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes..."
                      />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {
                          setIsModalOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Mark Attendance
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Attendance;