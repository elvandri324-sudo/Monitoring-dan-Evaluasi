import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Newspaper,
  Plus,
  Search,
  Filter,
  ExternalLink,
  FileText,
  Video,
  FileSpreadsheet,
  Trash2,
  Edit,
  Quote,
  MapPin,
  Users,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  Globe,
  Eye,
  X,
  Bookmark,
  FileCheck
} from 'lucide-react';
import {
  KnowledgeProduct,
  StoryOfChange,
  MediaCoverage,
  KnowledgeProductType,
  MediaCoverageType,
  Project
} from '../types';
import { useLanguage } from '../context/LanguageContext';

interface PublicationManagerProps {
  projects: Project[];
  selectedProjectId: string;
  isAdmin?: boolean;
  knowledgeProducts: KnowledgeProduct[];
  storiesOfChange: StoryOfChange[];
  mediaCoverages: MediaCoverage[];
  onSaveKnowledgeProduct: (item: KnowledgeProduct) => void;
  onDeleteKnowledgeProduct: (id: string) => void;
  onSaveStoryOfChange: (item: StoryOfChange) => void;
  onDeleteStoryOfChange: (id: string) => void;
  onSaveMediaCoverage: (item: MediaCoverage) => void;
  onDeleteMediaCoverage: (id: string) => void;
}

export default function PublicationManager({
  projects,
  selectedProjectId,
  isAdmin = true,
  knowledgeProducts,
  storiesOfChange,
  mediaCoverages,
  onSaveKnowledgeProduct,
  onDeleteKnowledgeProduct,
  onSaveStoryOfChange,
  onDeleteStoryOfChange,
  onSaveMediaCoverage,
  onDeleteMediaCoverage
}: PublicationManagerProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'stories' | 'media'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<KnowledgeProduct | null>(null);

  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryOfChange | null>(null);
  const [viewingStory, setViewingStory] = useState<StoryOfChange | null>(null);

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaCoverage | null>(null);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'story' | 'media';
    id: string;
    title: string;
  } | null>(null);

  // Form states for Knowledge Product
  const [productForm, setProductForm] = useState<Partial<KnowledgeProduct>>({
    type: 'Infografis / Factsheet',
    title: '',
    description: '',
    language: 'Bahasa Indonesia',
    publisherAuthor: 'Yayasan BINTARI',
    contributeToOutputOutcome: '',
    linkDocument: '',
    fileFormat: 'PDF',
    fileSize: ''
  });

  // Form states for Story of Change
  const [storyForm, setStoryForm] = useState<Partial<StoryOfChange>>({
    storyTitle: '',
    storiesLocation: '',
    whoHasChanged: '',
    highlightBefore: '',
    highlightAfter: '',
    importantQuotes: '',
    noteFullStory: '',
    categoryTheme: 'Kepemimpinan Perempuan',
    authorOrWriter: ''
  });

  // Form states for Media Coverage
  const [mediaForm, setMediaForm] = useState<Partial<MediaCoverage>>({
    title: '',
    type: 'Artikel Berita Online',
    platform: 'Website Berita',
    publisherMedia: '',
    linkToPublication: '',
    releaseDate: new Date().toISOString().split('T')[0],
    summaryNotes: ''
  });

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return knowledgeProducts.filter(item => {
      const matchProject = selectedProjectId === 'all' || !item.projectId || item.projectId === selectedProjectId;
      const matchSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.publisherAuthor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contributeToOutputOutcome.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchType = filterType === 'all' || item.type === filterType;
      const matchLang = filterLanguage === 'all' || item.language === filterLanguage;

      return matchProject && matchSearch && matchType && matchLang;
    });
  }, [knowledgeProducts, selectedProjectId, searchQuery, filterType, filterLanguage]);

  const filteredStories = useMemo(() => {
    return storiesOfChange.filter(item => {
      const matchProject = selectedProjectId === 'all' || !item.projectId || item.projectId === selectedProjectId;
      const matchSearch = searchQuery === '' || 
        item.storyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.whoHasChanged.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.storiesLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.highlightAfter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.importantQuotes.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchTheme = filterType === 'all' || item.categoryTheme === filterType;

      return matchProject && matchSearch && matchTheme;
    });
  }, [storiesOfChange, selectedProjectId, searchQuery, filterType]);

  const filteredMedia = useMemo(() => {
    return mediaCoverages.filter(item => {
      const matchProject = selectedProjectId === 'all' || !item.projectId || item.projectId === selectedProjectId;
      const matchSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.publisherMedia && item.publisherMedia.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchType = filterType === 'all' || item.type === filterType;

      return matchProject && matchSearch && matchType;
    });
  }, [mediaCoverages, selectedProjectId, searchQuery, filterType]);

  // Modal Open Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      projectId: selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || 'proj-01',
      type: 'Infografis / Factsheet',
      title: '',
      description: '',
      language: 'Bahasa Indonesia',
      publisherAuthor: 'Yayasan BINTARI',
      contributeToOutputOutcome: '',
      linkDocument: '',
      fileFormat: 'PDF',
      fileSize: '',
      releaseDate: new Date().toISOString().split('T')[0]
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (item: KnowledgeProduct) => {
    setEditingProduct(item);
    setProductForm({ ...item });
    setShowProductModal(true);
  };

  const handleOpenAddStory = () => {
    setEditingStory(null);
    setStoryForm({
      projectId: selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || 'proj-01',
      storyTitle: '',
      storiesLocation: '',
      whoHasChanged: '',
      highlightBefore: '',
      highlightAfter: '',
      importantQuotes: '',
      noteFullStory: '',
      categoryTheme: 'Kepemimpinan Perempuan',
      authorOrWriter: '',
      dateRecorded: new Date().toISOString().split('T')[0]
    });
    setShowStoryModal(true);
  };

  const handleOpenEditStory = (item: StoryOfChange) => {
    setEditingStory(item);
    setStoryForm({ ...item });
    setShowStoryModal(true);
  };

  const handleOpenAddMedia = () => {
    setEditingMedia(null);
    setMediaForm({
      projectId: selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || 'proj-01',
      title: '',
      type: 'Artikel Berita Online',
      platform: 'Website Berita',
      publisherMedia: '',
      linkToPublication: '',
      releaseDate: new Date().toISOString().split('T')[0],
      summaryNotes: ''
    });
    setShowMediaModal(true);
  };

  const handleOpenEditMedia = (item: MediaCoverage) => {
    setEditingMedia(item);
    setMediaForm({ ...item });
    setShowMediaModal(true);
  };

  // Submit Handlers
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.type) return;

    const item: KnowledgeProduct = {
      id: editingProduct ? editingProduct.id : `kp-${Date.now()}`,
      projectId: productForm.projectId || 'proj-01',
      type: (productForm.type as KnowledgeProductType) || 'Infografis / Factsheet',
      title: productForm.title || '',
      description: productForm.description || '',
      language: productForm.language || 'Bahasa Indonesia',
      publisherAuthor: productForm.publisherAuthor || 'Yayasan BINTARI',
      contributeToOutputOutcome: productForm.contributeToOutputOutcome || '',
      linkDocument: productForm.linkDocument || '#',
      fileFormat: productForm.fileFormat || 'PDF',
      fileSize: productForm.fileSize || '',
      releaseDate: productForm.releaseDate || new Date().toISOString().split('T')[0],
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    onSaveKnowledgeProduct(item);
    setShowProductModal(false);
  };

  const handleSaveStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.storyTitle) return;

    const item: StoryOfChange = {
      id: editingStory ? editingStory.id : `soc-${Date.now()}`,
      projectId: storyForm.projectId || 'proj-01',
      storyTitle: storyForm.storyTitle || '',
      storiesLocation: storyForm.storiesLocation || '',
      whoHasChanged: storyForm.whoHasChanged || '',
      highlightBefore: storyForm.highlightBefore || '',
      highlightAfter: storyForm.highlightAfter || '',
      importantQuotes: storyForm.importantQuotes || '',
      noteFullStory: storyForm.noteFullStory || '',
      categoryTheme: storyForm.categoryTheme || 'Kepemimpinan Perempuan',
      authorOrWriter: storyForm.authorOrWriter || '',
      dateRecorded: storyForm.dateRecorded || new Date().toISOString().split('T')[0],
      createdAt: editingStory ? editingStory.createdAt : new Date().toISOString()
    };

    onSaveStoryOfChange(item);
    setShowStoryModal(false);
  };

  const handleSaveMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaForm.title) return;

    const item: MediaCoverage = {
      id: editingMedia ? editingMedia.id : `mc-${Date.now()}`,
      projectId: mediaForm.projectId || 'proj-01',
      title: mediaForm.title || '',
      type: (mediaForm.type as MediaCoverageType) || 'Artikel Berita Online',
      platform: mediaForm.platform || 'Website Berita',
      publisherMedia: mediaForm.publisherMedia || '',
      linkToPublication: mediaForm.linkToPublication || '#',
      releaseDate: mediaForm.releaseDate || new Date().toISOString().split('T')[0],
      summaryNotes: mediaForm.summaryNotes || '',
      createdAt: editingMedia ? editingMedia.createdAt : new Date().toISOString()
    };

    onSaveMediaCoverage(item);
    setShowMediaModal(false);
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'product') {
      onDeleteKnowledgeProduct(deleteTarget.id);
    } else if (deleteTarget.type === 'story') {
      onDeleteStoryOfChange(deleteTarget.id);
    } else if (deleteTarget.type === 'media') {
      onDeleteMediaCoverage(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let fileName = '';

    if (activeSubTab === 'products') {
      fileName = isId ? 'Produk_Pengetahuan_Documents.csv' : 'Knowledge_Products_Documents.csv';
      headers = [
        'ID', 
        isId ? 'Tipe Produk' : 'Product Type', 
        isId ? 'Judul Produk' : 'Product Title', 
        isId ? 'Deskripsi' : 'Description', 
        isId ? 'Bahasa' : 'Language', 
        isId ? 'Penerbit / Penulis' : 'Publisher / Author', 
        isId ? 'Kontribusi Output/Outcome' : 'Contribute to Output/Outcome', 
        isId ? 'Tautan Dokumen' : 'Document Link'
      ];
      rows = filteredProducts.map(p => [
        p.id,
        `"${p.type}"`,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.description.replace(/"/g, '""')}"`,
        `"${p.language}"`,
        `"${p.publisherAuthor}"`,
        `"${p.contributeToOutputOutcome}"`,
        `"${p.linkDocument}"`
      ]);
    } else if (activeSubTab === 'stories') {
      fileName = isId ? 'Cerita_Perubahan_Stories_of_Change.csv' : 'Stories_of_Change.csv';
      headers = [
        'ID', 
        isId ? 'Judul Cerita' : 'Story Title', 
        isId ? 'Lokasi Cerita' : 'Story Location', 
        isId ? 'Siapa yang Berubah' : 'Who Has Changed', 
        isId ? 'Sorotan Sebelum Proyek' : 'Before Project Highlight', 
        isId ? 'Sorotan Setelah Proyek' : 'After Project Highlight', 
        isId ? 'Kutipan Penting' : 'Important Quotes', 
        isId ? 'Catatan / Tautan Lengkap' : 'Full Story Notes / Link'
      ];
      rows = filteredStories.map(s => [
        s.id,
        `"${s.storyTitle.replace(/"/g, '""')}"`,
        `"${s.storiesLocation.replace(/"/g, '""')}"`,
        `"${s.whoHasChanged.replace(/"/g, '""')}"`,
        `"${s.highlightBefore.replace(/"/g, '""')}"`,
        `"${s.highlightAfter.replace(/"/g, '""')}"`,
        `"${s.importantQuotes.replace(/"/g, '""')}"`,
        `"${s.noteFullStory.replace(/"/g, '""')}"`
      ]);
    } else {
      fileName = isId ? 'Liputan_Media_Sosial.csv' : 'Media_Coverage_Social.csv';
      headers = [
        'ID', 
        isId ? 'Judul Artikel / Berita' : 'Article / News Title', 
        isId ? 'Jenis Media' : 'Media Type', 
        'Platform', 
        isId ? 'Penerbit Media' : 'Publisher / Outlet', 
        isId ? 'Tautan Publikasi' : 'Publication Link', 
        isId ? 'Tanggal Terbit' : 'Release Date'
      ];
      rows = filteredMedia.map(m => [
        m.id,
        `"${m.title.replace(/"/g, '""')}"`,
        `"${m.type}"`,
        `"${m.platform}"`,
        `"${m.publisherMedia || ''}"`,
        `"${m.linkToPublication}"`,
        `"${m.releaseDate}"`
      ]);
    }

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Statistics Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-sm border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              {isId ? 'Pusat Publikasi & Manajemen Pengetahuan Proyek' : 'Publication Center & Project Knowledge Management'}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isId ? 'Publikasi & Cerita Perubahan' : 'Publications & Stories of Change'}
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {isId 
                ? 'Katalog terstruktur untuk produk pengetahuan, dokumen pembelajaran, cerita perubahan (story of change), dan arsip liputan media dari pelaksanaan program.'
                : 'Structured catalog for knowledge products, learning documents, stories of change, and media coverage archives from program implementation.'
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium flex items-center gap-2 border border-white/20 transition backdrop-blur-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              {isId ? 'Ekspor Tabel CSV' : 'Export CSV Table'}
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  if (activeSubTab === 'products') handleOpenAddProduct();
                  else if (activeSubTab === 'stories') handleOpenAddStory();
                  else handleOpenAddMedia();
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-900/30 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {activeSubTab === 'products' 
                  ? (isId ? '+ Input Produk Pengetahuan' : '+ Add Knowledge Product')
                  : activeSubTab === 'stories' 
                  ? (isId ? '+ Tulis Cerita Perubahan' : '+ Write Story of Change')
                  : (isId ? '+ Tambah Liputan Media' : '+ Add Media Coverage')}
              </button>
            )}
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-white/10">
          <div 
            onClick={() => setActiveSubTab('products')}
            className={`p-3.5 rounded-xl border transition cursor-pointer ${activeSubTab === 'products' ? 'bg-white/15 border-emerald-400 shadow-sm' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          >
            <div className="flex items-center justify-between text-emerald-200 text-xs font-medium">
              <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-emerald-400" /> {isId ? 'Produk Pengetahuan' : 'Knowledge Products'}</span>
              <span className="text-[11px] bg-emerald-500/30 px-2 py-0.5 rounded-full text-emerald-200">Documents</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1.5">{knowledgeProducts.length}</div>
            <div className="text-[11px] text-emerald-100/70 mt-0.5">
              {isId ? 'Modul, Factsheet, Laporan & Video' : 'Modules, Factsheets, Reports & Videos'}
            </div>
          </div>

          <div 
            onClick={() => setActiveSubTab('stories')}
            className={`p-3.5 rounded-xl border transition cursor-pointer ${activeSubTab === 'stories' ? 'bg-white/15 border-amber-400 shadow-sm' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          >
            <div className="flex items-center justify-between text-amber-200 text-xs font-medium">
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-400" /> {isId ? 'Cerita Perubahan' : 'Stories of Change'}</span>
              <span className="text-[11px] bg-amber-500/30 px-2 py-0.5 rounded-full text-amber-200">Story of Change</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1.5">{storiesOfChange.length}</div>
            <div className="text-[11px] text-amber-100/70 mt-0.5">
              {isId ? 'Testimoni & Kisah Nyata Komunitas' : 'Testimonials & Real Community Stories'}
            </div>
          </div>

          <div 
            onClick={() => setActiveSubTab('media')}
            className={`p-3.5 rounded-xl border transition cursor-pointer ${activeSubTab === 'media' ? 'bg-white/15 border-blue-400 shadow-sm' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          >
            <div className="flex items-center justify-between text-blue-200 text-xs font-medium">
              <span className="flex items-center gap-1.5"><Newspaper className="w-4 h-4 text-blue-400" /> {isId ? 'Liputan & Media Sosial' : 'Media Coverage & Social'}</span>
              <span className="text-[11px] bg-blue-500/30 px-2 py-0.5 rounded-full text-blue-200">Media Coverage</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1.5">{mediaCoverages.length}</div>
            <div className="text-[11px] text-blue-100/70 mt-0.5">
              {isId ? 'Artikel Berita, Siaran Pers & Portal' : 'News Articles, Press Releases & Portals'}
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation & Search / Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Sub Tab Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => { setActiveSubTab('products'); setFilterType('all'); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeSubTab === 'products'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              {isId ? 'Produk Pengetahuan' : 'Knowledge Products'} ({filteredProducts.length})
            </button>
            <button
              onClick={() => { setActiveSubTab('stories'); setFilterType('all'); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeSubTab === 'stories'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isId ? 'Cerita Perubahan' : 'Stories of Change'} ({filteredStories.length})
            </button>
            <button
              onClick={() => { setActiveSubTab('media'); setFilterType('all'); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeSubTab === 'media'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              {isId ? 'Liputan Media' : 'Media Coverage'} ({filteredMedia.length})
            </button>
          </div>

          {/* New Item Button for Mobile / Right side */}
          {isAdmin && (
            <button
              onClick={() => {
                if (activeSubTab === 'products') handleOpenAddProduct();
                else if (activeSubTab === 'stories') handleOpenAddStory();
                else handleOpenAddMedia();
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-end sm:self-auto transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {activeSubTab === 'products' 
                ? (isId ? 'Tambah Produk' : 'Add Product') 
                : activeSubTab === 'stories' 
                ? (isId ? 'Tambah Cerita' : 'Add Story') 
                : (isId ? 'Tambah Berita' : 'Add Coverage')}
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeSubTab === 'products'
                  ? (isId ? "Cari produk pengetahuan, judul, penulis, deskripsi, atau output..." : "Search knowledge products, title, author, description, or output...")
                  : activeSubTab === 'stories'
                  ? (isId ? "Cari cerita perubahan, nama tokoh, lokasi, atau kata kunci..." : "Search stories of change, person name, location, or keyword...")
                  : (isId ? "Cari artikel berita, platform, atau media publikasi..." : "Search news articles, platform, or media outlet...")
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeSubTab === 'products' && (
              <>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">{isId ? 'Semua Tipe Produk' : 'All Product Types'}</option>
                  <option value="Infografis / Factsheet">Infografis / Factsheet</option>
                  <option value="Video & Audio / Podcast">Video & Audio / Podcast</option>
                  <option value="Panduan / Modul / Buku">{isId ? 'Panduan / Modul / Buku' : 'Guide / Module / Book'}</option>
                  <option value="Laporan / Kajian Baseline & Endline">{isId ? 'Laporan / Kajian' : 'Reports / Assessments'}</option>
                  <option value="Policy Brief / Kertas Kebijakan">{isId ? 'Policy Brief / Kertas Kebijakan' : 'Policy Brief / White Paper'}</option>
                  <option value="Poster & Media Komunikasi (SBCC)">{isId ? 'Poster / Media SBCC' : 'Poster / SBCC Media'}</option>
                </select>

                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">{isId ? 'Semua Bahasa' : 'All Languages'}</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="Bahasa Inggris">English</option>
                  <option value="Dwibahasa (ID/EN)">Bilingual (ID/EN)</option>
                </select>
              </>
            )}

            {activeSubTab === 'stories' && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">{isId ? 'Semua Tema Cerita' : 'All Story Themes'}</option>
                <option value="Kepemimpinan Perempuan">{isId ? 'Kepemimpinan Perempuan' : 'Women Leadership'}</option>
                <option value="Kelola Hutan & Lingkungan">{isId ? 'Kelola Hutan & Lingkungan' : 'Forest & Environmental Governance'}</option>
                <option value="Inklusi Disabilitas">{isId ? 'Inklusi Disabilitas' : 'Disability Inclusion'}</option>
                <option value="Kemandirian Ekonomi">{isId ? 'Kemandirian Ekonomi' : 'Economic Self-Reliance'}</option>
                <option value="Perubahan Perilaku (SBCC)">{isId ? 'Perubahan Perilaku (SBCC)' : 'Behavior Change (SBCC)'}</option>
              </select>
            )}

            {activeSubTab === 'media' && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">{isId ? 'Semua Jenis Media' : 'All Media Types'}</option>
                <option value="Artikel Berita Online">{isId ? 'Artikel Berita Online' : 'Online News Article'}</option>
                <option value="Siaran Pers Resmi">{isId ? 'Siaran Pers Resmi' : 'Official Press Release'}</option>
                <option value="Liputan Khusus / Feature">{isId ? 'Liputan Khusus / Feature' : 'Special Feature / In-depth'}</option>
                <option value="Postingan Media Sosial (Instagram/FB/X)">{isId ? 'Media Sosial' : 'Social Media'}</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB TAB 1: DOKUMEN / PRODUK PENGETAHUAN (DOCUMENTS / KNOWLEDGE PRODUCTS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-base">
                {isId ? 'Dokumen & Produk Pengetahuan' : 'Documents & Knowledge Products'}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                {filteredProducts.length} {isId ? 'Data' : 'Items'}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {isId ? 'Sesuai format tabel Knowledge Products M&E' : 'According to M&E Knowledge Products format'}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">
                {isId ? 'Tidak ada produk pengetahuan ditemukan' : 'No knowledge products found'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isId ? 'Coba sesuaikan kata kunci pencarian atau tambah dokumen baru.' : 'Try adjusting your search keywords or add a new document.'}
              </p>
              {isAdmin && (
                <button
                  onClick={handleOpenAddProduct}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {isId ? '+ Input Produk Pengetahuan Baru' : '+ Add New Knowledge Product'}
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-800 text-white font-semibold">
                    <th className="py-3 px-4 w-44">{isId ? 'Tipe Produk' : 'Type of Product'}</th>
                    <th className="py-3 px-4 min-w-[200px]">{isId ? 'Judul' : 'Title'}</th>
                    <th className="py-3 px-4 min-w-[220px]">{isId ? 'Deskripsi' : 'Description'}</th>
                    <th className="py-3 px-4 w-28">{isId ? 'Bahasa' : 'Language'}</th>
                    <th className="py-3 px-4 w-36">{isId ? 'Penerbit / Penulis' : 'Publisher / Author'}</th>
                    <th className="py-3 px-4 min-w-[180px]">{isId ? 'Kontribusi Output/Outcome' : 'Contribute to Output/Outcome'}</th>
                    <th className="py-3 px-4 min-w-[180px]">{isId ? 'Tautan Berkas / Dokumen' : 'Link to Document'}</th>
                    {isAdmin && <th className="py-3 px-4 text-center w-24">{isId ? 'Aksi' : 'Actions'}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredProducts.map((item, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-emerald-50/40 transition ${isEven ? 'bg-white' : 'bg-slate-50/60'}`}
                      >
                        {/* Type of Product */}
                        <td className="py-3.5 px-4 font-medium align-top">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                            item.type.includes('Infografis') 
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.type.includes('Video')
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : item.type.includes('Panduan') || item.type.includes('Modul')
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : item.type.includes('Laporan')
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.type.includes('Policy')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {item.type.includes('Video') ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                            {item.type}
                          </span>
                        </td>

                        {/* Title */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                          {item.releaseDate && (
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {isId ? 'Rilis:' : 'Released:'} {item.releaseDate}
                              {item.fileSize && <span>• {item.fileSize}</span>}
                            </div>
                          )}
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-4 align-top text-slate-600 leading-relaxed text-[11px]">
                          {item.description || '-'}
                        </td>

                        {/* Language */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                            <Globe className="w-3 h-3 text-slate-400" />
                            {item.language}
                          </span>
                        </td>

                        {/* Publisher/Author */}
                        <td className="py-3.5 px-4 align-top font-medium text-slate-800 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.publisherAuthor}
                          </span>
                        </td>

                        {/* Contribute to Output/Outcome */}
                        <td className="py-3.5 px-4 align-top">
                          {item.contributeToOutputOutcome ? (
                            <span className="inline-block px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-[11px] font-medium leading-tight">
                              {item.contributeToOutputOutcome}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>

                        {/* Link to the document */}
                        <td className="py-3.5 px-4 align-top">
                          {item.linkDocument ? (
                            <a
                              href={item.linkDocument}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold transition group"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition" />
                              <span className="max-w-[150px] truncate">
                                {item.fileFormat ? `[${item.fileFormat}] ` : ''}{isId ? 'Buka Berkas' : 'Open File'}
                              </span>
                              <ExternalLink className="w-3 h-3 text-emerald-500 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Admin Action Buttons */}
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-center align-top">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditProduct(item)}
                                title={isId ? "Edit Dokumen" : "Edit Document"}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'product', id: item.id, title: item.title })}
                                title={isId ? "Hapus Dokumen" : "Delete Document"}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB 2: CERITA PERUBAHAN (STORIES OF CHANGE) */}
      {/* ========================================================================= */}
      {activeSubTab === 'stories' && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  {isId ? 'Cerita Perubahan (Stories of Change)' : 'Stories of Change (Most Significant Change)'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isId 
                    ? 'Dokumentasi dampak kualitatif, suara penerima manfaat, dan transformasi nyata di lapangan'
                    : 'Documentation of qualitative impacts, beneficiary voices, and real field transformations'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                {filteredStories.length} {isId ? 'Cerita Terdokumentasi' : 'Documented Stories'}
              </span>
              {isAdmin && (
                <button
                  onClick={handleOpenAddStory}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {isId ? '+ Tulis Cerita' : '+ Write Story'}
                </button>
              )}
            </div>
          </div>

          {filteredStories.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Sparkles className="w-12 h-12 text-amber-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">
                {isId ? 'Belum ada cerita perubahan' : 'No stories of change yet'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isId ? 'Dokumentasikan kisah inspiratif dan perubahan nyata dari penerima manfaat.' : 'Document inspiring stories and transformative changes from beneficiaries.'}
              </p>
              {isAdmin && (
                <button
                  onClick={handleOpenAddStory}
                  className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {isId ? '+ Tulis Cerita Perubahan Baru' : '+ Write New Story of Change'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredStories.map((story) => (
                <div 
                  key={story.id} 
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition p-5 sm:p-6 space-y-4"
                >
                  {/* Top Bar: Theme Badge, Location, Actions */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {story.categoryTheme && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                          {story.categoryTheme}
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {story.storiesLocation}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewingStory(story)}
                        className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isId ? 'Baca Lengkap' : 'Read Full Story'}
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEditStory(story)}
                            title={isId ? "Edit Cerita" : "Edit Story"}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'story', id: story.id, title: story.storyTitle })}
                            title={isId ? "Hapus Cerita" : "Delete Story"}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Story Title & Who has Changed */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {story.storyTitle}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-slate-400">{isId ? 'Penerima Manfaat / Tokoh:' : 'Beneficiary / Person:'}</span>
                      <span className="text-slate-800 font-semibold">{story.whoHasChanged}</span>
                    </div>
                  </div>

                  {/* Highlights Grid: Before vs After */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {/* Before Highlight */}
                    <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        {isId ? 'Sorotan Sebelum Proyek (Kondisi Awal)' : 'Before Project Highlight (Initial Condition)'}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {story.highlightBefore}
                      </p>
                    </div>

                    {/* After Highlight */}
                    <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {isId ? 'Sorotan Setelah Proyek (Perubahan Nyata)' : 'After Project Highlight (Real Transformation)'}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {story.highlightAfter}
                      </p>
                    </div>
                  </div>

                  {/* Important Quote / Testimonial */}
                  {story.importantQuotes && (
                    <div className="p-3.5 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-xl relative">
                      <Quote className="w-5 h-5 text-amber-400 absolute right-3 top-3 opacity-60" />
                      <div className="text-xs font-semibold text-amber-900 mb-1">
                        {isId ? 'Kutipan Penting / Testimoni:' : 'Key Quote / Testimonial:'}
                      </div>
                      <p className="text-xs italic text-amber-950 font-medium leading-relaxed pr-6">
                        {story.importantQuotes}
                      </p>
                    </div>
                  )}

                  {/* Bottom Footer Note & Writer */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{story.noteFullStory || (isId ? 'Tersedia di arsip laporan M&E.' : 'Available in M&E report archive.')}</span>
                    </div>
                    {story.authorOrWriter && (
                      <div className="text-slate-500 font-medium">
                        {isId ? 'Penulis/Pencatat:' : 'Author / Recorded by:'} {story.authorOrWriter}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB 3: MEDIA SOSIAL & LIPUTAN MEDIA (MEDIA COVERAGE) */}
      {/* ========================================================================= */}
      {activeSubTab === 'media' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">
                {isId ? 'Media Sosial & Liputan Media' : 'Social Media & Media Coverage'}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {filteredMedia.length} {isId ? 'Berita' : 'Items'}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {isId ? 'Rekam jejak publikasi eksternal & pemberitaan media' : 'Track record of external publications & press media'}
            </p>
          </div>

          {filteredMedia.length === 0 ? (
            <div className="p-12 text-center">
              <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">
                {isId ? 'Tidak ada liputan media ditemukan' : 'No media coverage found'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isId ? 'Tambahkan catatan publikasi berita atau tautan media sosial.' : 'Add news coverage records or social media links.'}
              </p>
              {isAdmin && (
                <button
                  onClick={handleOpenAddMedia}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {isId ? '+ Tambah Liputan Media Baru' : '+ Add New Media Coverage'}
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-800 text-white font-semibold">
                    <th className="py-3 px-4 min-w-[280px]">{isId ? 'Judul' : 'Title'}</th>
                    <th className="py-3 px-4 w-36">{isId ? 'Tipe' : 'Type'}</th>
                    <th className="py-3 px-4 w-32">Platform</th>
                    <th className="py-3 px-4 min-w-[260px]">{isId ? 'Tautan Publikasi' : 'Link to Publications'}</th>
                    <th className="py-3 px-4 w-32">{isId ? 'Tanggal Terbit' : 'Release Date'}</th>
                    {isAdmin && <th className="py-3 px-4 text-center w-24">{isId ? 'Aksi' : 'Actions'}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredMedia.map((item, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-blue-50/30 transition ${isEven ? 'bg-white' : 'bg-slate-50/60'}`}
                      >
                        {/* Title */}
                        <td className="py-3.5 px-4 align-top font-bold text-slate-900">
                          <div className="leading-snug">{item.title}</div>
                          {item.publisherMedia && (
                            <div className="text-[11px] font-normal text-slate-500 mt-1 flex items-center gap-1">
                              <Building className="w-3 h-3 text-slate-400" /> {isId ? 'Penerbit:' : 'Publisher:'} {item.publisherMedia}
                            </div>
                          )}
                          {item.summaryNotes && (
                            <div className="text-[11px] font-normal text-slate-600 mt-1.5 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                              {item.summaryNotes}
                            </div>
                          )}
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-4 align-top font-medium">
                          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium border border-slate-200">
                            {item.type}
                          </span>
                        </td>

                        {/* Platform */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            <Globe className="w-3 h-3" />
                            {item.platform}
                          </span>
                        </td>

                        {/* Link to Publications */}
                        <td className="py-3.5 px-4 align-top">
                          {item.linkToPublication ? (
                            <a
                              href={item.linkToPublication}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline text-[11px] font-medium break-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                              <span className="line-clamp-2">{item.linkToPublication}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Release Date */}
                        <td className="py-3.5 px-4 align-top font-medium text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {item.releaseDate}
                          </div>
                        </td>

                        {/* Admin Actions */}
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-center align-top">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditMedia(item)}
                                title={isId ? "Edit Berita" : "Edit News"}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'media', id: item.id, title: item.title })}
                                title={isId ? "Hapus Berita" : "Delete News"}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORM PRODUK PENGETAHUAN (KNOWLEDGE PRODUCT) */}
      {/* ========================================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingProduct 
                      ? (isId ? 'Edit Produk Pengetahuan' : 'Edit Knowledge Product') 
                      : (isId ? 'Input Produk Pengetahuan Baru' : 'Add New Knowledge Product')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isId ? 'Formulir pencatatan dokumen, fakta, panduan, atau video program' : 'Form for recording program documents, factsheets, modules, or videos'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Type of Product */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Tipe Produk (Type of Product)' : 'Type of Product'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={productForm.type || 'Infografis / Factsheet'}
                  onChange={(e) => setProductForm({ ...productForm, type: e.target.value as KnowledgeProductType })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Infografis / Factsheet">Infografis / Factsheet</option>
                  <option value="Video & Audio / Podcast">Video & Audio / Podcast</option>
                  <option value="Panduan / Modul / Buku">{isId ? 'Panduan / Modul / Buku' : 'Guide / Module / Book'}</option>
                  <option value="Laporan / Kajian Baseline & Endline">{isId ? 'Laporan / Kajian Baseline & Endline' : 'Report / Baseline & Endline Assessment'}</option>
                  <option value="Policy Brief / Kertas Kebijakan">{isId ? 'Policy Brief / Kertas Kebijakan' : 'Policy Brief / White Paper'}</option>
                  <option value="Poster & Media Komunikasi (SBCC)">{isId ? 'Poster & Media Komunikasi (SBCC)' : 'Poster & SBCC Media'}</option>
                  <option value="Materi Pelatihan / Presentasi">{isId ? 'Materi Pelatihan / Presentasi' : 'Training Materials / Presentations'}</option>
                  <option value="Lainnya">{isId ? 'Lainnya' : 'Other'}</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Judul Dokumen / Produk (Title)' : 'Document / Product Title'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={productForm.title || ''}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder={isId ? "Contoh: Modul Pelatihan Pemilahan Sampah Organik Rumah Tangga" : "E.g.: Household Organic Waste Segregation Training Module"}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Deskripsi Ringkas (Description)' : 'Brief Description'}
                </label>
                <textarea
                  rows={2}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder={isId ? "Penjelasan singkat mengenai materi, sasaran pembaca, dan kegunaan..." : "Brief overview of contents, target audience, and utility..."}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* 2 Column: Language & Publisher/Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isId ? 'Bahasa (Language)' : 'Language'}
                  </label>
                  <select
                    value={productForm.language || 'Bahasa Indonesia'}
                    onChange={(e) => setProductForm({ ...productForm, language: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Bahasa Inggris">English</option>
                    <option value="Dwibahasa (ID/EN)">Bilingual (ID/EN)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isId ? 'Penerbit / Penulis (Publisher / Author)' : 'Publisher / Author'}
                  </label>
                  <input
                    type="text"
                    value={productForm.publisherAuthor || ''}
                    onChange={(e) => setProductForm({ ...productForm, publisherAuthor: e.target.value })}
                    placeholder="Contoh: Yayasan BINTARI / Tim Proyek"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Contribute to Output/Outcome */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Kontribusi ke Output / Outcome Proyek' : 'Contribute to Project Output / Outcome'}
                </label>
                <input
                  type="text"
                  value={productForm.contributeToOutputOutcome || ''}
                  onChange={(e) => setProductForm({ ...productForm, contributeToOutputOutcome: e.target.value })}
                  placeholder={isId ? "Contoh: Output 1.2 & Outcome 1" : "E.g.: Output 1.2 & Outcome 1"}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Link Document */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Tautan Dokumen / URL Cloud Drive' : 'Document Link / Cloud Drive URL'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={productForm.linkDocument || ''}
                  onChange={(e) => setProductForm({ ...productForm, linkDocument: e.target.value })}
                  placeholder="https://drive.google.com/file/d/... atau https://bintari.org/publikasi/..."
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* 3 Column: Format, File Size, Release Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isId ? 'Format Berkas' : 'File Format'}
                  </label>
                  <select
                    value={productForm.fileFormat || 'PDF'}
                    onChange={(e) => setProductForm({ ...productForm, fileFormat: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="PDF">PDF</option>
                    <option value="MP4">MP4 Video</option>
                    <option value="MP3">MP3 Audio</option>
                    <option value="DOCX">DOCX Word</option>
                    <option value="PPTX">PPTX Slide</option>
                    <option value="Web Link">Web Link</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isId ? 'Ukuran Berkas' : 'File Size'}
                  </label>
                  <input
                    type="text"
                    value={productForm.fileSize || ''}
                    onChange={(e) => setProductForm({ ...productForm, fileSize: e.target.value })}
                    placeholder="Contoh: 4.2 MB"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isId ? 'Tanggal Rilis' : 'Release Date'}
                  </label>
                  <input
                    type="date"
                    value={productForm.releaseDate || ''}
                    onChange={(e) => setProductForm({ ...productForm, releaseDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  {editingProduct 
                    ? (isId ? 'Simpan Perubahan Dokumen' : 'Save Document Changes') 
                    : (isId ? 'Simpan Produk Pengetahuan' : 'Save Knowledge Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORM STORY OF CHANGE (CERITA PERUBAHAN) */}
      {/* ========================================================================= */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50/70 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingStory 
                      ? (isId ? 'Edit Cerita Perubahan' : 'Edit Story of Change') 
                      : (isId ? 'Tulis Cerita Perubahan Baru' : 'Write New Story of Change')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isId ? 'Format Most Significant Change (MSC) & Kisah Inspiratif' : 'Most Significant Change (MSC) & Inspiring Field Story'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowStoryModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStorySubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Judul Cerita (Story Title)' : 'Story Title'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={storyForm.storyTitle || ''}
                  onChange={(e) => setStoryForm({ ...storyForm, storyTitle: e.target.value })}
                  placeholder={isId ? "Contoh: Dari Ibu Rumah Tangga Menjadi Pelopor Bank Sampah Mandiri di Negeri Rutah" : "E.g.: From Homemaker to Pioneer of Community Waste Bank"}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* 3 Column: Location, Who has changed, Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isId ? 'Lokasi Cerita' : 'Story Location'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storyForm.storiesLocation || ''}
                    onChange={(e) => setStoryForm({ ...storyForm, storiesLocation: e.target.value })}
                    placeholder="Contoh: Desa Rutah, Amahai"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isId ? 'Siapa yang Berubah' : 'Who Has Changed'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storyForm.whoHasChanged || ''}
                    onChange={(e) => setStoryForm({ ...storyForm, whoHasChanged: e.target.value })}
                    placeholder="Contoh: Ibu Maryam (42 th), Kelompok Perempuan"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isId ? 'Tema / Kategori' : 'Theme / Category'}
                  </label>
                  <select
                    value={storyForm.categoryTheme || 'Kepemimpinan Perempuan'}
                    onChange={(e) => setStoryForm({ ...storyForm, categoryTheme: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="Kepemimpinan Perempuan">{isId ? 'Kepemimpinan Perempuan' : 'Women Leadership'}</option>
                    <option value="Kelola Hutan & Lingkungan">{isId ? 'Kelola Hutan & Lingkungan' : 'Forest & Environmental Governance'}</option>
                    <option value="Inklusi Disabilitas">{isId ? 'Inklusi Disabilitas' : 'Disability Inclusion'}</option>
                    <option value="Kemandirian Ekonomi">{isId ? 'Kemandirian Ekonomi' : 'Economic Self-Reliance'}</option>
                    <option value="Perubahan Perilaku (SBCC)">{isId ? 'Perubahan Perilaku (SBCC)' : 'Behavior Change (SBCC)'}</option>
                  </select>
                </div>
              </div>

              {/* 2 Column: Highlight Before vs After */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-rose-700 mb-1">
                    {isId ? 'Sorotan Sebelum Proyek (Kondisi Awal)' : 'Highlight Before Project (Initial Condition)'} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={storyForm.highlightBefore || ''}
                    onChange={(e) => setStoryForm({ ...storyForm, highlightBefore: e.target.value })}
                    placeholder={isId ? "Jelaskan situasi sulit, keterbatasan ekonomi, atau minimnya akses sebelum adanya intervensi program..." : "Describe initial difficulties, economic limits, or lack of access prior to program intervention..."}
                    required
                    className="w-full p-2.5 bg-rose-50/40 border border-rose-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-emerald-700 mb-1">
                    {isId ? 'Sorotan Setelah Proyek (Dampak Nyata)' : 'Highlight After Project (Real Impact)'} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={storyForm.highlightAfter || ''}
                    onChange={(e) => setStoryForm({ ...storyForm, highlightAfter: e.target.value })}
                    placeholder={isId ? "Jelaskan transformasi positif, peningkatan kapasitas, perubahan ekonomi, atau kemandirian..." : "Describe positive transformation, capacity boost, economic improvement, or self-reliance..."}
                    required
                    className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Important Quotes */}
              <div>
                <label className="block font-semibold text-amber-900 mb-1">
                  {isId ? 'Kutipan Penting / Suara Tokoh (Important Quotes)' : 'Important Quote / Beneficiary Voice'}
                </label>
                <textarea
                  rows={2}
                  value={storyForm.importantQuotes || ''}
                  onChange={(e) => setStoryForm({ ...storyForm, importantQuotes: e.target.value })}
                  placeholder={isId ? 'Contoh: "Dulu kami merasa suara perempuan tidak didengar. Sekarang kami mandiri dan bangga menjaga hutan adat."' : 'E.g.: "In the past, we felt women voices were not heard. Now we are proud and self-reliant in safeguarding our community."'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 italic focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Note / Comments for full story */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Catatan / Referensi Dokumen / Tautan Lengkap' : 'Note / Reference / Full Story Link'}
                </label>
                <input
                  type="text"
                  value={storyForm.noteFullStory || ''}
                  onChange={(e) => setStoryForm({ ...storyForm, noteFullStory: e.target.value })}
                  placeholder={isId ? "Contoh: Termuat dalam Laporan Tahunan M&E 2025 Halaman 42 atau Tautan Video" : "E.g.: Included in Annual M&E Report 2025 Page 42 or Video Link"}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStoryModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  {editingStory 
                    ? (isId ? 'Simpan Perubahan Cerita' : 'Save Story Changes') 
                    : (isId ? 'Simpan Cerita Perubahan' : 'Save Story of Change')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FORM MEDIA COVERAGE (LIPUTAN MEDIA) */}
      {/* ========================================================================= */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-blue-50/70 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingMedia 
                      ? (isId ? 'Edit Liputan Media' : 'Edit Media Coverage') 
                      : (isId ? 'Tambah Liputan Media / Berita' : 'Add Media Coverage / News')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isId ? 'Sesuai format tabel Social Media & Media Coverage' : 'According to Social Media & Media Coverage format'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowMediaModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMediaSubmit} className="p-5 space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Judul Artikel / Liputan Berita (Title)' : 'Article / News Title'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={mediaForm.title || ''}
                  onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                  placeholder={isId ? "Contoh: Pemda Maluku Tengah Optimis Target Bebas Sampah" : "E.g.: Local Government Optimistic About Waste Free Target"}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* 2 Column: Type & Platform */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isId ? 'Jenis Publikasi (Type)' : 'Publication Type'}
                  </label>
                  <select
                    value={mediaForm.type || 'Artikel Berita Online'}
                    onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Artikel Berita Online">{isId ? 'Artikel Berita Online' : 'Online News Article'}</option>
                    <option value="Siaran Pers Resmi">{isId ? 'Siaran Pers Resmi' : 'Official Press Release'}</option>
                    <option value="Liputan Khusus / Feature">{isId ? 'Liputan Khusus / Feature' : 'Special Feature'}</option>
                    <option value="Postingan Media Sosial (Instagram/FB/X)">{isId ? 'Postingan Media Sosial' : 'Social Media Post'}</option>
                    <option value="Video YouTube / Dokumenter">{isId ? 'Video Berita / YouTube' : 'News Video / YouTube'}</option>
                    <option value="Media Cetak / Koran">{isId ? 'Media Cetak / Koran' : 'Print Media / Newspaper'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={mediaForm.platform || 'Website Berita'}
                    onChange={(e) => setMediaForm({ ...mediaForm, platform: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Website Berita">{isId ? 'Website / Media Online' : 'Website / Online News'}</option>
                    <option value="Portal Pemda">{isId ? 'Portal Resmi Pemda' : 'Official Government Portal'}</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Media Cetak">{isId ? 'Media Cetak / Koran' : 'Print Media / Newspaper'}</option>
                  </select>
                </div>
              </div>

              {/* Publisher Media & Release Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isId ? 'Penerbit / Media Publikasi' : 'Publisher / News Outlet'}
                  </label>
                  <input
                    type="text"
                    value={mediaForm.publisherMedia || ''}
                    onChange={(e) => setMediaForm({ ...mediaForm, publisherMedia: e.target.value })}
                    placeholder="Contoh: Tribun Ambon / Liputan Maluku"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isId ? 'Tanggal Terbit (Release Date)' : 'Release Date'}
                  </label>
                  <input
                    type="date"
                    value={mediaForm.releaseDate || ''}
                    onChange={(e) => setMediaForm({ ...mediaForm, releaseDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Link to Publications */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Tautan / URL Berita (Link)' : 'Publication Link / URL'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={mediaForm.linkToPublication || ''}
                  onChange={(e) => setMediaForm({ ...mediaForm, linkToPublication: e.target.value })}
                  placeholder="https://malteng.liputan.co.id/article_read/..."
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Summary Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isId ? 'Ringkasan / Catatan Berita' : 'Summary / Coverage Notes'}
                </label>
                <textarea
                  rows={2}
                  value={mediaForm.summaryNotes || ''}
                  onChange={(e) => setMediaForm({ ...mediaForm, summaryNotes: e.target.value })}
                  placeholder={isId ? "Catatan ringkas mengenai poin penting pemberitaan..." : "Brief notes regarding key coverage highlights..."}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMediaModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  {editingMedia 
                    ? (isId ? 'Simpan Perubahan' : 'Save Changes') 
                    : (isId ? 'Simpan Liputan Media' : 'Save Media Coverage')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VIEW FULL STORY MODAL */}
      {/* ========================================================================= */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  {isId ? 'Cerita Perubahan Lengkap' : 'Full Story of Change'}
                </h3>
              </div>
              <button
                onClick={() => setViewingStory(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                    {viewingStory.categoryTheme}
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    {viewingStory.storiesLocation}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {viewingStory.storyTitle}
                </h2>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  {isId ? 'Tokoh / Kelompok:' : 'Beneficiary / Group:'} <strong className="text-slate-800">{viewingStory.whoHasChanged}</strong>
                </div>
              </div>

              {/* Before & After Detailed Narrative */}
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                  <h4 className="font-bold text-rose-800 text-xs mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    {isId ? 'Kondisi Sebelum Program (Situasi Awal):' : 'Condition Before Project (Initial Situation):'}
                  </h4>
                  <p className="text-slate-700">{viewingStory.highlightBefore}</p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-800 text-xs mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {isId ? 'Transformasi Setelah Intervensi (Dampak Nyata):' : 'Transformation After Intervention (Real Impact):'}
                  </h4>
                  <p className="text-slate-700">{viewingStory.highlightAfter}</p>
                </div>
              </div>

              {/* Quotes */}
              {viewingStory.importantQuotes && (
                <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl">
                  <div className="text-xs font-semibold text-amber-800 mb-1">
                    {isId ? 'Testimoni & Suara Penerima Manfaat:' : 'Testimonial & Beneficiary Voices:'}
                  </div>
                  <p className="text-xs italic text-amber-950 font-medium leading-relaxed">
                    {viewingStory.importantQuotes}
                  </p>
                </div>
              )}

              {/* Reference */}
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <span>{viewingStory.noteFullStory || (isId ? 'Terdokumentasi dalam sistem M&E BINTARI.' : 'Documented in BINTARI M&E system.')}</span>
                {viewingStory.dateRecorded && <span>{isId ? 'Direkam:' : 'Recorded:'} {viewingStory.dateRecorded}</span>}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingStory(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isId ? 'Konfirmasi Hapus Data' : 'Confirm Delete Data'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isId ? 'Tindakan ini tidak dapat dibatalkan' : 'This action cannot be undone'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 my-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {isId ? 'Apakah Anda yakin ingin menghapus data:' : 'Are you sure you want to delete data:'} <strong className="text-slate-900">{deleteTarget.title}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                {isId ? 'Ya, Hapus Data' : 'Yes, Delete Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
