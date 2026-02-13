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
    setStatusFilter,
    fetchPaginatedNGOs,
    searchNGOs,
    handleApproval,
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
      setStatusFilter={setStatusFilter}
      fetchPaginatedNGOs={fetchPaginatedNGOs}
      searchNGOs={searchNGOs}
      handleApproval={handleApproval}
      setSearchTerm={setSearchTerm}
    />
  );
}
