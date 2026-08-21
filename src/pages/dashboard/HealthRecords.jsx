import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, PlusCircle, Search, Filter, ArrowUpDown, 
  Eye, Edit3, Trash2, ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import RecordModal from '../../components/records/RecordModal';

import { recordsAPI } from '../../services/api';

const HealthRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertState, setAlertState] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const fetchRecords = useCallback(async (page = 1, searchQuery = '', status = 'All') => {
    setLoading(true);
    try {
      const data = await recordsAPI.getAll({ page, limit: 15, search: searchQuery, status });
      if (data.records) {
        const formatted = data.records.map((r) => ({
          id: r._id,
          date: new Date(r.createdAt || r.date).toISOString().split('T')[0],
          type: r.type || r.recordType || 'General Checkup',
          doctor: r.doctor || 'Not specified',
          bp: `${r.vitals?.bpSystolic || r.bloodPressure || '--'}/${r.vitals?.bpDiastolic || '--'}`,
          sugar: r.vitals?.sugarFasting || r.glucose || '--',
          bmi: String(r.bmi || '--'),
          status: r.status || 'Recorded',
          notes: r.notes || 'Health record saved.',
          rawRecord: r,
        }));
        setRecords(formatted);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.warn('Could not load records:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(1, search, filterStatus);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords(1, search, filterStatus);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, filterStatus]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchRecords(newPage, search, filterStatus);
  };

  const handleOpenModal = (record, mode) => {
    setSelectedRecord(record);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedRecord) {
      try {
        await recordsAPI.delete(selectedRecord.id);
        setRecords(records.filter(r => r.id !== selectedRecord.id));
        setIsModalOpen(false);
        setAlertState({ type: 'success', title: 'Deleted', message: 'Record deleted successfully.' });
        fetchRecords(pagination.page, search, filterStatus);
      } catch (err) {
        console.warn('Could not delete record from backend:', err.message);
        setAlertState({
          type: 'error',
          title: 'Delete Failed',
          message: err.message || 'Unable to delete record from server.'
        });
      }
    }
  };

  const handleSaveRecord = async (updatedData) => {
    if (!selectedRecord) return;
    try {
      await recordsAPI.update(selectedRecord.id, {
        type: updatedData.type,
        notes: updatedData.notes,
      });
      setRecords(records.map(r => r.id === selectedRecord.id ? { ...r, type: updatedData.type, notes: updatedData.notes } : r));
      setAlertState({ type: 'success', title: 'Record Updated', message: 'Health record updated successfully.' });
    } catch (err) {
      setAlertState({ type: 'error', title: 'Update Failed', message: err.message || 'Unable to update record.' });
    }
  };

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold border border-brand-500/30 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Health Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Health Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {pagination.total} records stored securely
          </p>
        </div>

        <Link to="/records/add">
          <Button className="flex items-center gap-2 shrink-0">
            <PlusCircle className="w-4 h-4" />
            <span>Add Health Record</span>
          </Button>
        </Link>
      </div>

      {alertState && (
        <Alert
          type={alertState.type}
          title={alertState.title}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search records, doctors, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Optimal', 'Good', 'Mild Watch', 'High Risk'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Record ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Checkup Type</th>
                  <th className="py-3.5 px-4">Attending Doctor</th>
                  <th className="py-3.5 px-4">Vitals (BP / Sugar)</th>
                  <th className="py-3.5 px-4">BMI</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {records.length > 0 ? (
                  records.map((rec) => (
                    <tr 
                      key={rec.id}
                      className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {rec.id.slice(-6)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">{rec.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {rec.type}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{rec.doctor}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                        <span className="text-emerald-400">{rec.bp}</span> / <span className="text-cyan-400">{rec.sugar}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">{rec.bmi}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          rec.status === 'Optimal' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : rec.status === 'Good'
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            : rec.status === 'High Risk'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {rec.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleOpenModal(rec, 'view')}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-brand-400 transition-colors"
                          title="View Record"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(rec, 'edit')}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-cyan-400 transition-colors"
                          title="Edit Record"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(rec, 'delete')}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-rose-400 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No health records found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {startItem}–{endItem} of {pagination.total} records
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-brand-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-brand-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RECORD MODAL */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={selectedRecord}
        mode={modalMode}
        onDelete={handleDelete}
        onSave={handleSaveRecord}
      />

    </div>
  );
};

export default HealthRecords;
