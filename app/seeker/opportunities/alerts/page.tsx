'use client';

import React, { useState } from 'react';
import { BellIcon, PlusIcon, TrashIcon, PencilIcon, BriefcaseIcon, BanknotesIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

// Sample alert data
const SAMPLE_ALERTS = [
  {
    id: 1,
    title: 'Frontend Developer',
    category: 'job',
    location: 'Remote',
    frequency: 'Daily',
    created: '2 weeks ago',
    keywords: ['React', 'TypeScript', 'JavaScript'],
    isActive: true
  },
  {
    id: 2,
    title: 'Tech Startup Grants',
    category: 'funding',
    location: 'Global',
    frequency: 'Weekly',
    created: '1 month ago',
    keywords: ['Startup', 'Innovation', 'Technology'],
    isActive: true
  },
  {
    id: 3,
    title: 'Web Development Bootcamps',
    category: 'training',
    location: 'Online',
    frequency: 'Weekly',
    created: '3 weeks ago',
    keywords: ['Full Stack', 'Bootcamp', 'Web Development'],
    isActive: false
  },
  {
    id: 4,
    title: 'UX Designer',
    category: 'job',
    location: 'New York, NY',
    frequency: 'Daily',
    created: '5 days ago',
    keywords: ['Figma', 'UI Design', 'Prototyping'],
    isActive: true
  }
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(SAMPLE_ALERTS);
  const [showNewAlertForm, setShowNewAlertForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newAlert, setNewAlert] = useState({
    title: '',
    category: 'job',
    location: '',
    frequency: 'Daily',
    keywords: ''
  });

  const filteredAlerts = selectedCategory === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.category === selectedCategory);

  const handleDeleteAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const handleToggleAlert = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const handleSubmitAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const keywordsArray = newAlert.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k !== '');
      
    const alert = {
      id: Date.now(),
      title: newAlert.title,
      category: newAlert.category as 'job' | 'funding' | 'training',
      location: newAlert.location,
      frequency: newAlert.frequency,
      created: 'Just now',
      keywords: keywordsArray,
      isActive: true
    };
    
    setAlerts([alert, ...alerts]);
    setNewAlert({ title: '', category: 'job', location: '', frequency: 'Daily', keywords: '' });
    setShowNewAlertForm(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'job': return <BriefcaseIcon className="w-5 h-5" />;
      case 'funding': return <BanknotesIcon className="w-5 h-5" />;
      case 'training': return <AcademicCapIcon className="w-5 h-5" />;
      default: return <BellIcon className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'job': return 'bg-blue-100 text-blue-800';
      case 'funding': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <header className="flex items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Opportunity Alerts</h1>
        <div className="ml-auto flex gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <BellIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>
      
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Opportunity Alerts</h2>
              <p className="text-gray-600">
                Create alerts for jobs, funding, and training opportunities. Get notified when matching opportunities are posted.
              </p>
            </div>
            <button 
              onClick={() => setShowNewAlertForm(true)}
              className="px-4 py-2 bg-olive-dark text-white rounded-md flex items-center gap-2 hover:bg-olive-medium transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              New Alert
            </button>
          </div>
          
          {/* Category Filter */}
          <div className="mb-6">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
            >
              <option value="all">All Categories</option>
              <option value="job">Jobs</option>
              <option value="funding">Funding</option>
              <option value="training">Training</option>
            </select>
          </div>
          
          {/* Alert Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-1">Total Alerts</h3>
              <p className="text-2xl font-bold text-blue-900">{filteredAlerts.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-medium text-green-800 mb-1">Active</h3>
              <p className="text-2xl font-bold text-green-900">
                {filteredAlerts.filter(alert => alert.isActive).length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="font-medium text-yellow-800 mb-1">Jobs</h3>
              <p className="text-2xl font-bold text-yellow-900">
                {alerts.filter(alert => alert.category === 'job').length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="font-medium text-purple-800 mb-1">Funding + Training</h3>
              <p className="text-2xl font-bold text-purple-900">
                {alerts.filter(alert => ['funding', 'training'].includes(alert.category)).length}
              </p>
            </div>
          </div>
          
          {/* New Alert Form */}
          {showNewAlertForm && (
            <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Create New Alert</h3>
              <form onSubmit={handleSubmitAlert}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title*
                    </label>
                    <input
                      type="text"
                      value={newAlert.title}
                      onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                      placeholder="e.g. Frontend Developer, Tech Grants"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      value={newAlert.category}
                      onChange={(e) => setNewAlert({...newAlert, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                      required
                    >
                      <option value="job">Jobs</option>
                      <option value="funding">Funding</option>
                      <option value="training">Training</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newAlert.location}
                      onChange={(e) => setNewAlert({...newAlert, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                      placeholder="e.g. Remote, Global, New York"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newAlert.keywords}
                      onChange={(e) => setNewAlert({...newAlert, keywords: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                      placeholder="e.g. React, Startup, Bootcamp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={newAlert.frequency}
                      onChange={(e) => setNewAlert({...newAlert, frequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Instant">Instant</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowNewAlertForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-olive-dark text-white rounded-md hover:bg-olive-medium transition-colors"
                  >
                    Create Alert
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Alerts List */}
          {filteredAlerts.length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.map(alert => (
                <div key={alert.id} className={`border rounded-lg p-5 transition-all ${
                  alert.isActive 
                    ? 'bg-white border-gray-200 hover:shadow-sm' 
                    : 'bg-gray-50 border-gray-200 opacity-75'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(alert.category)}`}>
                        {getCategoryIcon(alert.category)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{alert.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {alert.location} • {alert.frequency} alerts • Created {alert.created}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full capitalize ${getCategoryColor(alert.category)}`}>
                          {alert.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alert.isActive}
                          onChange={() => handleToggleAlert(alert.id)}
                          className="sr-only"
                        />
                        <div className={`relative w-10 h-6 rounded-full transition-colors ${
                          alert.isActive ? 'bg-olive-dark' : 'bg-gray-300'
                        }`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            alert.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </div>
                      </label>
                      <button className="p-2 text-gray-500 hover:text-olive-medium rounded-full transition-colors">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        className="p-2 text-gray-500 hover:text-red-500 rounded-full transition-colors"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {alert.keywords.map(keyword => (
                      <span key={keyword} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No alerts found</h3>
              <p className="text-gray-500 mb-4">
                {selectedCategory === 'all' 
                  ? 'Create your first alert to get notified of new opportunities'
                  : `No ${selectedCategory} alerts found. Try a different category or create a new alert.`
                }
              </p>
              <button 
                onClick={() => setShowNewAlertForm(true)}
                className="px-4 py-2 bg-olive-dark text-white rounded-md hover:bg-olive-medium transition-colors"
              >
                Create Alert
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 