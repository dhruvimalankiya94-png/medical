import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Calendar, User, HeartPulse, Trash2, Edit3 } from 'lucide-react';
import Button from '../common/Button';

const RecordModal = ({ isOpen, onClose, record, mode = 'view', onDelete, onSave }) => {
  const [editData, setEditData] = useState(null);

  React.useEffect(() => {
    if (record && mode === 'edit') {
      setEditData({ ...record });
    }
  }, [record, mode]);

  if (!isOpen || !record) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl z-10 border border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {mode === 'delete' ? 'Delete Health Record' : mode === 'edit' ? 'Edit Record' : 'Record Details'}
                </h3>
                <p className="text-xs text-slate-400">ID: {record.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {mode === 'delete' ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                  <Trash2 className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-white">Are you sure?</h4>
                <p className="text-sm text-slate-300">
                  This action will permanently delete record **{record.id}** ({record.type}). This action cannot be undone.
                </p>
              </div>
            ) : mode === 'edit' ? (
              <div className="space-y-3 text-xs sm:text-sm">
                {editData && (
                  <>
                    <div className="space-y-2">
                      <label className="text-slate-400 block text-[11px] font-bold">Record Type</label>
                      <input
                        type="text"
                        value={editData.type}
                        onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-slate-400 block text-[11px] font-bold">Blood Pressure</label>
                        <input
                          type="text"
                          value={editData.bp}
                          onChange={(e) => setEditData({ ...editData, bp: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-emerald-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-slate-400 block text-[11px] font-bold">Sugar Level</label>
                        <input
                          type="text"
                          value={editData.sugar}
                          onChange={(e) => setEditData({ ...editData, sugar: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-cyan-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-400 block text-[11px] font-bold">Notes</label>
                      <textarea
                        rows="3"
                        value={editData.notes}
                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-xs italic focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Record Type:</span>
                    <span className="font-bold text-white">{record.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date Logged:</span>
                    <span className="font-bold text-slate-200">{record.date}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Blood Pressure</span>
                    <span className="font-bold text-emerald-400">{record.bp}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Sugar Level</span>
                    <span className="font-bold text-cyan-400">{record.sugar}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px] font-bold">Notes</span>
                  <p className="text-slate-300 text-xs italic">{record.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/40">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {mode === 'delete' ? (
              <Button variant="primary" className="bg-rose-600 hover:bg-rose-700" onClick={onDelete}>
                Confirm Delete
              </Button>
            ) : mode === 'edit' ? (
              <Button variant="primary" onClick={() => { if (onSave) onSave(editData); onClose(); }}>
                Save Changes
              </Button>
            ) : (
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RecordModal;
