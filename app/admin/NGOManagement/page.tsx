"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useFetchNGOs } from "./FetchNGOs";
import DisplayNGOs from "./DisplayNGOs";

export default function NGOManagementPage() {
  const {
    ngos,
    loading,
    stats,
    currentPage,
    totalCount,
    searchTerm,
    statusFilter,
    approvingNGO,
    deletingNGO,
    setStatusFilter,
    fetchPaginatedNGOs,
    searchNGOs,
    handleApproval,
    handleDeleteNGO,
    setSearchTerm
  } = useFetchNGOs();

  return (
    <DisplayNGOs
      ngos={ngos}
      loading={loading}
      stats={stats}
      currentPage={currentPage}
      totalCount={totalCount}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      approvingNGO={approvingNGO}
      deletingNGO={deletingNGO}
      setStatusFilter={setStatusFilter}
      fetchPaginatedNGOs={fetchPaginatedNGOs}
      searchNGOs={searchNGOs}
      handleApproval={handleApproval}
      handleDeleteNGO={handleDeleteNGO}
      setSearchTerm={setSearchTerm}
    />
  );
}
