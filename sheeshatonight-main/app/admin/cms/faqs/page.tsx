'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Plus,
  Save,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Loader2,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  enabled: boolean;
}

const CATEGORIES = ['All', 'Delivery', 'Rentals', 'Lounges', 'Payments', 'Compliance'];

export default function AdminFaqsPage() {
  const { addToast } = useToast();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalQuestion, setModalQuestion] = useState('');
  const [modalAnswer, setModalAnswer] = useState('');
  const [modalCategory, setModalCategory] = useState('Delivery');

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/cms/faqs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setFaqs(json.data || []);
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load FAQs.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setModalQuestion('');
    setModalAnswer('');
    setModalCategory('Delivery');
    setModalOpen(true);
  };

  const handleOpenEdit = (faq: FaqItem) => {
    setEditingId(faq.id);
    setModalQuestion(faq.question);
    setModalAnswer(faq.answer);
    setModalCategory(faq.category || 'Delivery');
    setModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalQuestion.trim() || !modalAnswer.trim()) return;

    if (editingId) {
      const updated = faqs.map((f) =>
        f.id === editingId
          ? { ...f, question: modalQuestion.trim(), answer: modalAnswer.trim(), category: modalCategory }
          : f
      );
      setFaqs(updated);
    } else {
      const newFaq: FaqItem = {
        id: Date.now().toString(),
        question: modalQuestion.trim(),
        answer: modalAnswer.trim(),
        category: modalCategory,
        order: faqs.length + 1,
        enabled: true,
      };
      setFaqs([...faqs, newFaq]);
    }

    setModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = faqs.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    setFaqs(updated);
  };

  const handleDelete = (id: string) => {
    const updated = faqs.filter((f) => f.id !== id);
    setFaqs(updated.map((f, i) => ({ ...f, order: i + 1 })));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const updated = [...faqs];
    const temp = updated[index];
    const target = updated[targetIndex];
    if (!temp || !target) return;
    updated[index] = target;
    updated[targetIndex] = temp;

    setFaqs(updated.map((f, i) => ({ ...f, order: i + 1 })));
  };

  const handlePublishAll = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/cms/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ faqs }),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'FAQs Published',
          message: 'Frequently Asked Questions list saved in MySQL and live on /faqs!',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Failed',
          message: 'Could not save FAQs.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Network error saving FAQs.',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredFaqs = selectedCategory === 'All'
    ? faqs
    : faqs.filter((f) => f.category === selectedCategory);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#74189B] hover:text-[#571275] mb-1.5 transition"
          >
            <ArrowLeft size={14} /> Back to CMS Overview
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Frequently Asked Questions (FAQ) Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add, edit, reorder, categorize, and publish questions displayed on the customer FAQ page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchFaqs}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs"
            title="Refresh FAQs"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition shadow-xs"
          >
            <Plus size={16} /> Add FAQ
          </button>
          <button
            onClick={handlePublishAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#74189B] to-[#571275] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-[#74189B]/20 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Publish FAQs
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === cat
                ? 'bg-[#74189B] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat} {cat === 'All' ? `(${faqs.length})` : `(${faqs.filter((f) => f.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* FAQs List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <Loader2 className="w-8 h-8 text-[#74189B] animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading FAQs...</p>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <HelpCircle size={40} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800 text-base">No questions found in this category</h3>
          <p className="text-xs text-slate-500">Click &quot;Add FAQ&quot; to create your first question and answer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div
              key={faq.id}
              className={`p-4 rounded-2xl border transition-all ${
                faq.enabled
                  ? 'bg-white border-slate-200/90 shadow-xs hover:border-[#74189B]/40'
                  : 'bg-slate-50 border-slate-200/50 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-purple-50 text-[#74189B] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {faq.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{faq.question}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                    title="Move Up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === filteredFaqs.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                    title="Move Down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(faq.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      faq.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {faq.enabled ? 'Active' : 'Disabled'}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(faq)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                    title="Edit FAQ"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600"
                    title="Delete FAQ"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit FAQ Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">{editingId ? 'Edit FAQ' : 'Add New FAQ'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={modalQuestion}
                  onChange={(e) => setModalQuestion(e.target.value)}
                  placeholder="e.g. How fast is on-demand sheesha delivery?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Answer *</label>
                <textarea
                  required
                  rows={4}
                  value={modalAnswer}
                  onChange={(e) => setModalAnswer(e.target.value)}
                  placeholder="Provide a comprehensive answer for customers..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#74189B] text-white hover:bg-[#571275] font-bold"
                >
                  {editingId ? 'Update Item' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

