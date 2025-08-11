"use client";

import { useState, useEffect } from "react";
import { 
  getAllNGOProfiles, 
  getPaginatedNGOProfiles, 
  searchNGOProfiles,
  getNGOProfileStats,
  updateNGOApprovalStatus,
  type NGOProfile 
} from "./supabaseService";
import toast from "react-hot-toast";

export const useFetchNGOs = () => {
  const [ngos, setNgos] = useState<NGOProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [approvingNGO, setApprovingNGO] = useState<string | null>(null);

  const fetchAllNGOs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await getAllNGOProfiles();
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch NGOs');
      }
      
      setNgos(data || []);
    } catch (err: any) {
      console.error('Error fetching NGOs:', err);
      setError(err.message || 'Failed to fetch NGOs');
      toast.error('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaginatedNGOs = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error, totalCount } = await getPaginatedNGOProfiles(page, limit);
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch NGOs');
      }
      
      setNgos(data || []);
      setTotalCount(totalCount);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error fetching paginated NGOs:', err);
      setError(err.message || 'Failed to fetch NGOs');
      toast.error('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  const searchNGOs = async (term: string, page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error, totalCount } = await searchNGOProfiles(term, page, limit);
      
      if (error) {
        throw new Error(error.message || 'Failed to search NGOs');
      }
      
      setNgos(data || []);
      setTotalCount(totalCount);
      setCurrentPage(page);
      setSearchTerm(term);
    } catch (err: any) {
      console.error('Error searching NGOs:', err);
      setError(err.message || 'Failed to search NGOs');
      toast.error('Failed to search NGOs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await getNGOProfileStats();
      
      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }
      
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleApproval = async (ngoId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      setApprovingNGO(ngoId);
      
      const { data, error } = await updateNGOApprovalStatus(ngoId, action, notes);
      
      if (error) {
        throw new Error(error.message || 'Failed to update approval status');
      }

      toast.success(`NGO ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      
      // Refresh the current data
      if (searchTerm) {
        await searchNGOs(searchTerm, currentPage);
      } else {
        await fetchPaginatedNGOs(currentPage);
      }
      
      // Refresh stats
      await fetchStats();
    } catch (err: any) {
      console.error('Error updating approval status:', err);
      toast.error(err.message || 'Failed to update approval status');
    } finally {
      setApprovingNGO(null);
    }
  };

  const filteredNGOs = ngos.filter(ngo => {
    const matchesSearch = searchTerm === "" || 
      ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ngo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ngo.legal_rep_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ngo.approval_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Initial load
  useEffect(() => {
    fetchPaginatedNGOs(1);
    fetchStats();
  }, []);

  return {
    ngos: filteredNGOs,
    loading,
    error,
    stats,
    currentPage,
    totalCount,
    searchTerm,
    statusFilter,
    approvingNGO,
    setStatusFilter,
    fetchAllNGOs,
    fetchPaginatedNGOs,
    searchNGOs,
    handleApproval,
    setSearchTerm
  };
};
