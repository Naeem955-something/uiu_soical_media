import React, { useRef, useState } from 'react';
import { X, Image as ImageIcon, Paperclip, File } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FilePickResult, readFileAsDataURL } from '../../utils/fileUtils';

export const CreatePostModal: React.FC = () => {
  const { isCreatePostModalOpen, setIsCreatePostModalOpen, createPost, user } = useApp();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);
  const [pickedImage, setPickedImage] = useState<FilePickResult | null>(null);
  const [pickedFile, setPickedFile] = useState<FilePickResult | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCreatePostModalOpen) return null;

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const picked = await readFileAsDataURL(file);
      setPickedImage(picked);
      setShowImageInput(true);
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const picked = await readFileAsDataURL(file);
      setPickedFile(picked);
      if (!fileName.trim()) setFileName(picked.name);
      setShowFileInput(true);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const resetState = () => {
    setContent('');
    setImageUrl('');
    setFileName('');
    setShowImageInput(false);
    setShowFileInput(false);
    setPickedImage(null);
    setPickedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const finalImage = pickedImage?.dataUrl
      ? undefined
      : (imageUrl.trim() ? imageUrl.trim() : undefined);
    const finalImageDataUrl = pickedImage?.dataUrl;

    const finalFile = pickedFile
      ? {
          name: pickedFile.name,
          size: pickedFile.sizeLabel,
          mimeType: pickedFile.mimeType,
          extension: pickedFile.extension,
          fileData: pickedFile.dataUrl
        }
      : (fileName.trim() ? { name: fileName.trim(), size: '1.8 MB' } : undefined);

    createPost(
      content,
      finalImage,
      finalFile,
      finalImageDataUrl
    );

    resetState();
    setIsCreatePostModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCreatePostModalOpen(false)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Campus Post</h3>
          <button 
            className="modal-close-btn"
            onClick={() => { resetState(); setIsCreatePostModalOpen(false); }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <img 
                src={user.avatar} 
                alt={user.name} 
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{user.name}</h4>
                <span className="badge badge-student" style={{ marginTop: 2 }}>{user.department}</span>
              </div>
            </div>

            <textarea 
              rows={4}
              placeholder="What's happening in your academic world? Share project updates, study questions, or announcements..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              autoFocus
              style={{ resize: 'vertical' }}
            />

            {showImageInput && (
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Image (Upload file or paste URL)
                </label>
                <input 
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                  style={{ width: '100%', padding: '10px 12px', marginTop: 4 }}
                />
                {pickedImage ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginTop: 10,
                    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <img src={pickedImage.dataUrl || ''} alt={pickedImage.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pickedImage.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pickedImage.sizeLabel} • {pickedImage.format}</div>
                    </div>
                    <button type="button" className="nav-icon-btn" onClick={() => setPickedImage(null)} style={{ width: 30, height: 30 }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <input 
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    style={{ marginTop: 4 }}
                  />
                )}
              </div>
            )}

            {showFileInput && (
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Attachment (Upload file or type a name)
                </label>
                <input 
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFilePick}
                  style={{ width: '100%', padding: '10px 12px', marginTop: 4 }}
                />
                {pickedFile ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginTop: 10,
                    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(14,165,233,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <File size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pickedFile.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pickedFile.sizeLabel} • {pickedFile.format}</div>
                    </div>
                    <button type="button" className="nav-icon-btn" onClick={() => setPickedFile(null)} style={{ width: 30, height: 30 }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <input 
                    type="text"
                    placeholder="Robotics_Research_Notes.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    style={{ marginTop: 4 }}
                  />
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-muted)' }}>Add to post:</span>
              <button 
                type="button" 
                className="composer-tool-btn"
                onClick={() => setShowImageInput(!showImageInput)}
                style={{ color: showImageInput ? 'var(--primary)' : undefined }}
              >
                <ImageIcon size={18} /> Image
              </button>
              <button 
                type="button" 
                className="composer-tool-btn"
                onClick={() => setShowFileInput(!showFileInput)}
                style={{ color: showFileInput ? 'var(--primary)' : undefined }}
              >
                <Paperclip size={18} /> File
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => { resetState(); setIsCreatePostModalOpen(false); }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
