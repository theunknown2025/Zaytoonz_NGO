'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth';

interface NGO {
  id: string;
  name: string;
  email: string;
  approval_status: string;
  created_at: string;
}

export default function TestNGOPage() {
  const { user } = useAuth();
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching NGOs...');
      const response = await fetch('/api/admin/ngos');
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('NGOs data:', data);
      
      setNgos(data.ngos || []);
    } catch (error: any) {
      console.error('Error fetching NGOs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test NGO Page</h1>
        <p>Please log in to test the NGO API.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test NGO Page</h1>
      
      <div className="mb-4">
        <p><strong>Current User:</strong> {user.email}</p>
        <p><strong>User Type:</strong> {user.userType}</p>
      </div>

      <button 
        onClick={fetchNGOs}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Refresh NGOs
      </button>

      {loading && <p>Loading NGOs...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          <h2 className="text-xl font-semibold mb-2">NGOs ({ngos.length})</h2>
          {ngos.length === 0 ? (
            <p>No NGOs found.</p>
          ) : (
            <div className="space-y-2">
              {ngos.map((ngo) => (
                <div key={ngo.id} className="border p-4 rounded">
                  <p><strong>Name:</strong> {ngo.name}</p>
                  <p><strong>Email:</strong> {ngo.email}</p>
                  <p><strong>Status:</strong> {ngo.approval_status}</p>
                  <p><strong>Created:</strong> {new Date(ngo.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
