import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Search, 
  Download, 
  Bookmark, 
  Star, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  Code,
  X,
  File
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FilePickResult, readFileAsDataURL, triggerDownload, sanitizeFileName, inferExtension, inferFormat } from '../utils/fileUtils';

export const ResourcesView: React.FC = () => {
  const { 
    resources, 
    toggleBookmarkResource, 
    addResource, 
    user, 
    showToast,
    incrementResourceDownload
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [courseCodeSearch, setCourseCodeSearch] = useState('');
  const [sortBy, setSortBy] = useState<'Newest' | 'Popular' | 'Rating'>('Newest');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload modal form states
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('CS-402');
  const [category, setCategory] = useState<'Lecture Notes' | 'Research Papers' | 'Exam Prep' | 'Code Templates'>('Lecture Notes');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [description, setDescription] = useState('');
  const [pickedFile, setPickedFile] = useState<FilePickResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const picked = await readFileAsDataURL(file);
      setPickedFile(picked);
      setFileFormat(picked.format);
      if (!title.trim()) {
        const noExt = file.name.replace(/\.[^.]+$/, '');
        setTitle(noExt);
      }
    } catch (err) {
      console.error('file read failed', err);
      showToast('Could not read selected file', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearPickedFile = () => {
    setPickedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = (res: typeof resources[number]) => {
    incrementResourceDownload(res.id);
    const ext = res.extension || inferExtension(res.fileName || `${res.title}.${(res.fileFormat || 'txt').toLowerCase()}`, `.${(res.fileFormat || 'txt').toLowerCase()}`);
    const baseName = res.fileName || sanitizeFileName(`${res.title}${ext}`, `resource_${res.id}${ext}`);
    const fileName = res.fileName ? sanitizeFileName(res.fileName, baseName) : baseName;
    if (res.fileData) {
      triggerDownload(fileName, res.fileData, { asBase64: true, mimeType: res.mimeType || undefined });
    } else {
      const content = [
        `# ${res.title}`,
        `Course: ${res.courseCode}`,
        `Category: ${res.category}`,
        `Author: ${res.authorName}`,
        `Format: ${res.fileFormat}`,
        `Size: ${res.fileSize || 'Unknown'}`,
        '',
        res.description || 'No description provided.'
      ].join('\n');
      const mime = ext === '.pdf' ? 'application/pdf' : ext === '.md' ? 'text/markdown' : 'text/plain';
      const actualName = fileName.endsWith(ext) ? fileName : `${fileName}${ext === '.pdf' ? '.txt' : ext}`;
      triggerDownload(actualName, content, { mimeType: mime });
    }
    showToast(`Downloaded "${res.title}" (${res.fileFormat})`, 'success');
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalFormat = pickedFile ? pickedFile.format : fileFormat;
    const finalCategory = category;

    addResource({
      title: title.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      category: finalCategory,
      authorName: user.name,
      authorAvatar: user.avatar,
      fileSize: pickedFile ? pickedFile.sizeLabel : '4.2 MB',
      fileFormat: finalFormat,
      description: description.trim(),
      fileName: pickedFile ? pickedFile.name : undefined,
      mimeType: pickedFile ? pickedFile.mimeType : undefined,
      extension: pickedFile ? pickedFile.extension : undefined,
      fileData: pickedFile?.dataUrl
    });

    setTitle('');
    setDescription('');
    setPickedFile(null);
    setShowUploadModal(false);
  };

  const filteredResources = resources.filter(res => {
    if (selectedCategory !== 'All Categories' && res.category !== selectedCategory) return false;
    if (courseCodeSearch.trim() && !res.courseCode.toLowerCase().includes(courseCodeSearch.toLowerCase()) && !res.title.toLowerCase().includes(courseCodeSearch.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'Popular') return b.downloads - a.downloads;
    if (sortBy === 'Rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Resource Sharing Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            The digital library for your academic success.
          </p>
        </div>

        <button 
          className="btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={18} /> Upload Resource
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="resource-filter-bar">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ width: 180 }}
        >
          <option value="All Categories">All Categories</option>
          <option value="Lecture Notes">Lecture Notes</option>
          <option value="Research Papers">Research Papers</option>
          <option value="Exam Prep">Exam Prep</option>
          <option value="Code Templates">Code Templates</option>
        </select>

        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-light)' }} />
          <input 
            type="text" 
            placeholder="Filter by Course Code (e.g. CS-402, SE-301)..." 
            value={courseCodeSearch}
            onChange={(e) => setCourseCodeSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        <select 
          value={sortBy} 
          onChange={(e: any) => setSortBy(e.target.value)}
          style={{ width: 160 }}
        >
          <option value="Newest">Sort: Newest</option>
          <option value="Popular">Sort: Most Downloaded</option>
          <option value="Rating">Sort: Highest Rated</option>
        </select>
      </div>

      {/* Main Grid: Sidebar + Resources */}
      <div className="resources-layout">
        {/* Left Sub-Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 18 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em', display: 'block', marginBottom: 12 }}>
              CATEGORIES
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'Lecture Notes', icon: <FileText size={16} /> },
                { label: 'Research Papers', icon: <BookOpen size={16} /> },
                { label: 'Exam Prep', icon: <GraduationCap size={16} /> },
                { label: 'Code Templates', icon: <Code size={16} /> }
              ].map(cat => (
                <button
                  key={cat.label}
                  className={`category-nav-item ${selectedCategory === cat.label ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === cat.label ? 'All Categories' : cat.label)}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                MY BOOKMARKS
              </span>
              <span className="badge badge-student">12</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.875rem' }}>
              <div style={{ cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600 }} onClick={() => setCourseCodeSearch('Algorithms')}>
                Advanced Algorithms V2
              </div>
              <div style={{ cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600 }} onClick={() => setCourseCodeSearch('Ethics')}>
                ML Ethics Final Paper
              </div>
              <div style={{ cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600 }} onClick={() => setCourseCodeSearch('Physics')}>
                Physics Lab 101
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 18, background: '#F8FAFC' }}>
            <div style={{ fontSize: '0.813rem', fontWeight: 700, marginBottom: 8, color: '#D97706' }}>
              Storage Usage
            </div>
            <div style={{ height: 6, background: '#E2E8F0', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ width: '65%', height: '100%', background: 'var(--primary)' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1.3 GB of 2 GB used</span>
          </div>
        </aside>

        {/* Resources Cards Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.25rem' }}>Trending Resources</h3>
            <button style={{ color: '#D97706', fontWeight: 600, fontSize: '0.875rem' }}>View All</button>
          </div>

          <div className="resources-grid">
            {filteredResources.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '56px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>No resources found</p>
                <p style={{ fontSize: '0.875rem' }}>There are currently no notes or study templates uploaded. Click "Upload Resource" above to share one!</p>
              </div>
            ) : (
              filteredResources.map(res => (
              <div key={res.id} className="resource-card card-hoverable">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className="resource-course-badge">{res.courseCode}</span>
                    <button 
                      onClick={() => toggleBookmarkResource(res.id)}
                      style={{ color: res.isBookmarked ? 'var(--primary)' : 'var(--text-light)' }}
                    >
                      <Bookmark size={18} fill={res.isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>
                    {res.title}
                  </h4>

                  <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                    {res.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={res.authorAvatar} alt={res.authorName} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                    <div style={{ fontSize: '0.813rem' }}>
                      <strong>{res.authorName}</strong>
                      <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>{res.timeAgo} • {res.fileSize}</div>
                    </div>
                  </div>
                </div>

                <div className="resource-footer-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Download size={14} /> {res.downloads.toLocaleString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', fontWeight: 700 }}>
                      <Star size={14} fill="#D97706" /> {res.rating}
                    </span>
                  </div>

                  <button 
                    className="nav-icon-btn" 
                    style={{ width: 34, height: 34, color: 'var(--primary)' }}
                    onClick={() => handleDownload(res)}
                    title="Download resource"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div style={{
        marginTop: 36,
        background: 'var(--primary)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 40px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--primary-shadow)'
      }}>
        <div>
          <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: 6 }}>Have great notes?</h3>
          <p style={{ color: '#FEF3C7', fontSize: '0.95rem' }}>
            Contribute to the campus ecosystem and earn reputation points.
          </p>
        </div>

        <button 
          className="btn-secondary"
          style={{ background: 'white', color: '#D97706', fontWeight: 800, padding: '12px 28px' }}
          onClick={() => setShowUploadModal(true)}
        >
          Start Uploading
        </button>
      </div>

      {/* Upload Resource Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Academic Resource</h3>
              <button className="modal-close-btn" onClick={() => setShowUploadModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Document Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Algorithms Midterm Cheat Sheet" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Course Code *</label>
                    <input 
                      type="text" 
                      placeholder="CS-402" 
                      value={courseCode} 
                      onChange={(e) => setCourseCode(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Category</label>
                    <select value={category} onChange={(e: any) => setCategory(e.target.value)}>
                      <option value="Lecture Notes">Lecture Notes</option>
                      <option value="Research Papers">Research Papers</option>
                      <option value="Exam Prep">Exam Prep</option>
                      <option value="Code Templates">Code Templates</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>File Format</label>
                  <select value={fileFormat} onChange={(e) => setFileFormat(e.target.value)} disabled={!!pickedFile} style={pickedFile ? { opacity: 0.7 } : undefined}>
                    <option value="PDF">PDF Document (.pdf)</option>
                    <option value="DOCX">Word Document (.docx)</option>
                    <option value="ZIP">Archive (.zip)</option>
                    <option value="PPTX">Presentation (.pptx)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Upload File</label>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    id="resource-file-picker"
                    onChange={handleFileChange}
                    style={{ width: '100%', padding: '10px 12px' }}
                  />
                </div>
                {pickedFile && (
                  <div className="attachment-preview" style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{
                      width: 40, height: 40, background: 'rgba(14,165,233,0.1)', color: 'var(--primary)',
                      borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <File size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pickedFile.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {pickedFile.sizeLabel} • {pickedFile.format}
                      </div>
                    </div>
                    <button type="button" className="nav-icon-btn" onClick={clearPickedFile} title="Remove file" style={{ width: 30, height: 30 }}>
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea 
                    rows={3} 
                    placeholder="Brief outline of topics covered, chapters, or exam focus..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Upload to Library</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
