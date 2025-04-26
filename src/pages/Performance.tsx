import React, { useState } from 'react';
import { Star, TrendingUp, MessageSquare, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const Performance = () => {
  const { performances, interns, addPerformanceReview } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    internId: '',
    rating: 5,
    tasksCompleted: 0,
    feedback: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPerformanceReview({
      ...newReview,
      lastReview: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(false);
    setNewReview({
      internId: '',
      rating: 5,
      tasksCompleted: 0,
      feedback: '',
    });
    toast.success('Performance review added successfully!');
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Performance Reviews</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Review
        </button>
      </div>

      <div className="grid gap-6">
        {performances.map((review) => {
          const intern = interns.find((i) => i.id === review.internId);
          return (
            <div key={review.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{intern?.name}</h2>
                  <p className="text-gray-500">{intern?.role}</p>
                </div>
                <div className="flex items-center">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-gray-600">{review.rating}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Tasks Completed
                  </div>
                  <p className="text-2xl font-semibold mt-1">{review.tasksCompleted}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-600">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Last Review
                  </div>
                  <p className="text-2xl font-semibold mt-1">{review.lastReview}</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-medium text-gray-900">Feedback</h3>
                <p className="mt-1 text-gray-600">{review.feedback}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Performance Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Intern</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={newReview.internId}
                  onChange={(e) => setNewReview({ ...newReview, internId: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="5"
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tasks Completed</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={newReview.tasksCompleted}
                  onChange={(e) => setNewReview({ ...newReview, tasksCompleted: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Feedback</label>
                <textarea
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={4}
                  value={newReview.feedback}
                  onChange={(e) => setNewReview({...newReview, feedback: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;