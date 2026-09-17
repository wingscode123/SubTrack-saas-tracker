import React, { useRef, useState } from 'react';
import {
  Download,
  FileJson,
  RotateCcw,
  Save,
  Upload,
  User,
  X,
} from 'lucide-react';
import { Subscription, UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  subscriptions: Subscription[];
  onSaveProfile: (profile: UserProfile) => void;
  onImportData: (importedSubs: Subscription[]) => void;
  onResetData: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  subscriptions,
  onSaveProfile,
  onImportData,
  onResetData,
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [currency, setCurrency] = useState(profile.defaultCurrency);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name: name.trim(),
      email: email.trim(),
      defaultCurrency: currency,
    });
    onClose();
  };

  const handleExportJSON = () => {
    const dataToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      subscriptions,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtrack_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Category',
      'Price',
      'Currency',
      'BillingCycle',
      'NextDueDate',
      'PaymentMethod',
      'Status',
      'Notes',
    ];
    const rows = subscriptions.map((s) => [
      `"${s.name}"`,
      `"${s.category}"`,
      s.price,
      s.currency,
      s.billingCycle,
      s.nextDueDate,
      `"${s.paymentMethod || ''}"`,
      s.status,
      `"${s.notes || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtrack_subscriptions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed.subscriptions)) {
          onImportData(parsed.subscriptions);
          setImportStatus(`Berhasil mengimpor ${parsed.subscriptions.length} langganan!`);
        } else if (Array.isArray(parsed)) {
          onImportData(parsed);
          setImportStatus(`Berhasil mengimpor ${parsed.length} langganan!`);
        } else {
          setImportStatus('Format file tidak valid.');
        }
      } catch (err) {
        setImportStatus('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Profil &amp; Preferensi Akun
              </h3>
              <p className="text-xs text-slate-500">
                Sesuaikan mata uang default dan cadangkan data
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Pengguna
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mata Uang Tampilan Utama
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 font-semibold text-slate-800"
            >
              <option value="IDR">IDR (Rupiah Indonesia - Rp)</option>
              <option value="USD">USD (US Dollar - $)</option>
              <option value="EUR">EUR (Euro - €)</option>
              <option value="GBP">GBP (British Pound - £)</option>
              <option value="SGD">SGD (Singapore Dollar - S$)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Semua total biaya bulanan &amp; tahunan akan dikonversi otomatis ke mata uang ini.
            </p>
          </div>

          {/* Backup & Export / Import section */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              Cadangan &amp; Ekspor Data
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor JSON</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Ekspor CSV</span>
              </button>
            </div>

            <div className="pt-1">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Impor Cadangan File JSON</span>
              </button>
            </div>

            {importStatus && (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium">
                {importStatus}
              </p>
            )}
          </div>

          {/* Reset button */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan data ke contoh awal Dina (Freelancer)?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-rose-600 flex items-center justify-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Data Demo Awal</span>
            </button>
          </div>

          {/* Footer Save */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-xs"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
