'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Save,
  Trash2,
  Edit2,
  Eye,
  ArrowLeft,
  ExternalLink,
  Calendar,
  User,
  Clock,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Upload,
  Globe,
  RefreshCw,
  X
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  category: string;
  readTime: string;
  published: boolean;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

const CATEGORIES = ['All', 'Flavors', 'Events', 'Guide', 'Lifestyle', 'Weddings', 'Health'];

export default function AdminBlogsPage() {
  const { addToast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal / Editor State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('/blog.webp');
  const [author, setAuthor] = useState('SheeshaTonight Editorial');
  const [category, setCategory] = useState('Flavors');
  const [readTime, setReadTime] = useState('5 min read');
  const [published, setPublished] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/cms/blogs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setBlogs(json.data || []);
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load blog articles.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setImage('/blog.webp');
    setAuthor('SheeshaTonight Sommelier');
    setCategory('Flavors');
    setReadTime('5 min read');
    setPublished(true);
    setSeoTitle('');
    setSeoDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (blog: BlogPost) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setSlug(blog.slug);
    setExcerpt(blog.excerpt);
    setContent(blog.content);
    setImage(blog.image || '/blog.webp');
    setAuthor(blog.author || 'Editorial');
    setCategory(blog.category || 'Flavors');
    setReadTime(blog.readTime || '5 min read');
    setPublished(blog.published !== false);
    setSeoTitle(blog.seoTitle || '');
    setSeoDescription(blog.seoDescription || '');
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.urls && json.urls.length > 0) {
          setImage(json.urls[0]);
          addToast({
            type: 'success',
            title: 'Image Uploaded',
            message: 'Featured image uploaded.',
          });
        }
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Upload Error',
        message: 'Failed to upload image file.',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const blogItem: BlogPost = {
      id: editingId || Date.now().toString(),
      slug: finalSlug,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      image,
      author: author.trim(),
      category,
      readTime,
      published,
      publishedAt: editingId
        ? blogs.find((b) => b.id === editingId)?.publishedAt || new Date().toISOString()
        : new Date().toISOString(),
      seoTitle: seoTitle || `${title} | SheeshaTonight`,
      seoDescription: seoDescription || excerpt,
    };

    if (editingId) {
      setBlogs(blogs.map((b) => (b.id === editingId ? blogItem : b)));
    } else {
      setBlogs([blogItem, ...blogs]);
    }

    setModalOpen(false);
  };

  const handleTogglePublish = (id: string) => {
    setBlogs(blogs.map((b) => (b.id === id ? { ...b, published: !b.published } : b)));
  };

  const handleDelete = (id: string) => {
    setBlogs(blogs.filter((b) => b.id !== id));
  };

  const handlePublishAll = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/cms/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ blogs }),
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Articles Published',
          message: 'Blog catalog committed to MySQL and live on /blogs!',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Could not save blog articles.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to database server.',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            Blog & Editorial Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish shisha culture articles, flavor guides, lounge spotlights, and private party recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBlogs}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs"
            title="Refresh Articles"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition shadow-xs"
          >
            <Plus size={16} /> New Article
          </button>
          <button
            onClick={handlePublishAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#74189B] to-[#571275] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-[#74189B]/20 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Publish Blogs
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-[#74189B] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#74189B]"
        />
      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <Loader2 className="w-8 h-8 text-[#74189B] animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading Articles...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <BookOpen size={40} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800 text-base">No articles found</h3>
          <p className="text-xs text-slate-500">Create an article or adjust your search filter above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                blog.published ? 'border-slate-200 hover:border-[#74189B]/40' : 'border-slate-200/60 opacity-65'
              }`}
            >
              <div>
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                  <img
                    src={blog.image || '/blog.webp'}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md">
                      {blog.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        blog.published ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                      }`}
                    >
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2 text-xs">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">{blog.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <User size={12} /> {blog.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {blog.readTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  href={`/blogs/${blog.slug}?preview=true`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#74189B] hover:underline"
                >
                  <Eye size={13} /> View
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePublish(blog.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      blog.published
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {blog.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(blog)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                    title="Edit article"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600"
                    title="Delete article"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Blog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Article' : 'Write New Article'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Top 10 Best Shisha Flavors to Try in 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-900 outline-none focus:border-[#74189B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="best-shisha-flavors-2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Ahmed Hassan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="e.g. 5 min read"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Featured Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Featured Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upload Image</label>
                  <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#74189B] bg-slate-50 cursor-pointer font-bold text-slate-600">
                    {uploadingImage ? <Loader2 size={14} className="animate-spin text-[#74189B]" /> : <Upload size={14} />}
                    <span>{uploadingImage ? 'Uploading...' : 'Choose File'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Excerpt / Summary</label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief synopsis for cards and search results..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Body (Supports HTML & Paragraphs) *</label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<p>Write your article here...</p><h2>Subheading</h2><p>Details...</p>"
                  className="w-full p-3.5 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed"
                />
              </div>

              {/* SEO Meta */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe size={14} className="text-[#74189B]" /> Article SEO Metadata
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Meta Title"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Meta Description"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 accent-[#74189B]"
                  />
                  <span>Published on Storefront</span>
                </label>

                <div className="flex items-center gap-2">
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
                    {editingId ? 'Update Article' : 'Save Article'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

