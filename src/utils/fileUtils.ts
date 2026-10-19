export interface FilePickResult {
  name: string;
  size: number;
  sizeLabel: string;
  type: string;
  mimeType: string;
  format: string;
  extension: string;
  dataUrl?: string;
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'];

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const i = Math.min(BYTE_UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const v = bytes / Math.pow(1024, i);
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${BYTE_UNITS[i]}`;
}

const FORMAT_BY_EXT: Record<string, string> = {
  '.pdf': 'PDF',
  '.doc': 'DOC',
  '.docx': 'DOCX',
  '.txt': 'TXT',
  '.md': 'MD',
  '.zip': 'ZIP',
  '.rar': 'RAR',
  '.ppt': 'PPT',
  '.pptx': 'PPTX',
  '.xls': 'XLS',
  '.xlsx': 'XLSX',
  '.csv': 'CSV',
  '.png': 'PNG',
  '.jpg': 'JPG',
  '.jpeg': 'JPG',
  '.gif': 'GIF',
  '.webp': 'WEBP',
  '.svg': 'SVG',
  '.py': 'PY',
  '.js': 'JS',
  '.ts': 'TS',
  '.tsx': 'TSX',
  '.jsx': 'JSX',
  '.java': 'JAVA',
  '.cpp': 'CPP',
  '.c': 'C',
  '.html': 'HTML',
  '.css': 'CSS',
  '.json': 'JSON',
};

const MIME_TO_FORMAT: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT',
  'text/markdown': 'MD',
  'application/zip': 'ZIP',
  'application/vnd.rar': 'RAR',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'text/csv': 'CSV',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/gif': 'GIF',
  'image/webp': 'WEBP',
  'image/svg+xml': 'SVG',
  'text/x-python': 'PY',
  'application/javascript': 'JS',
  'text/javascript': 'JS',
  'text/typescript': 'TS',
  'application/x-java': 'JAVA',
};

export function inferFormatFromFileName(name: string): string {
  const idx = name.lastIndexOf('.');
  const ext = idx >= 0 ? name.slice(idx).toLowerCase() : '';
  if (ext && FORMAT_BY_EXT[ext]) return FORMAT_BY_EXT[ext];
  return ext ? ext.slice(1).toUpperCase().slice(0, 5) : 'FILE';
}

export function inferFormat(mimeType: string, fileName: string): string {
  if (mimeType && MIME_TO_FORMAT[mimeType]) return MIME_TO_FORMAT[mimeType];
  return inferFormatFromFileName(fileName);
}

export function inferExtension(fileName: string, fallback = '.txt'): string {
  const idx = fileName.lastIndexOf('.');
  if (idx >= 0 && idx < fileName.length - 1) return fileName.slice(idx).toLowerCase();
  return fallback;
}

export function inferMimeFromName(name: string): string {
  const ext = inferExtension(name, '').toLowerCase();
  const map: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.zip': 'application/zip',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.py': 'text/plain',
    '.js': 'text/plain',
    '.ts': 'text/plain',
    '.json': 'application/json',
    '.html': 'text/html',
    '.ics': 'text/calendar',
    '.vcs': 'text/calendar',
  };
  return map[ext] || 'application/octet-stream';
}

const MAX_READ_BYTES = 128 * 1024;

export function readFileAsDataURL(
  file: File,
  maxBytes: number = MAX_READ_BYTES
): Promise<FilePickResult> {
  return new Promise((resolve, reject) => {
    try {
      const extension = inferExtension(file.name, '.bin');
      const format = inferFormat(file.type || '', file.name);
      const resultBase: FilePickResult = {
        name: file.name,
        size: file.size,
        sizeLabel: formatBytes(file.size),
        type: format,
        format,
        mimeType: file.type || inferMimeFromName(file.name),
        extension,
      };

      if (file.size === 0) {
        resolve(resultBase);
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => resolve(resultBase);

      if (file.size <= maxBytes) {
        reader.onload = () => {
          resolve({
            ...resultBase,
            dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
          });
        };
        reader.readAsDataURL(file);
      } else {
        const sliceReader = new FileReader();
        sliceReader.onerror = () => resolve(resultBase);
        sliceReader.onload = () => {
          resolve({
            ...resultBase,
            dataUrl: typeof sliceReader.result === 'string' ? sliceReader.result : undefined,
          });
        };
        const blob = file.slice(0, maxBytes);
        sliceReader.readAsDataURL(blob);
      }
    } catch (e) {
      reject(e);
    }
  });
}

export function dataUrlToBlob(dataUrl: string, fallbackMime = 'application/octet-stream'): Blob {
  try {
    const metaMatch = dataUrl.match(/^data:([^;,]+)(?:;base64)?,/);
    const mime = metaMatch ? metaMatch[1] : fallbackMime;
    const comma = dataUrl.indexOf(',');
    const encoded = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    const isBase64 = /;base64,/.test(dataUrl);
    if (isBase64) {
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    }
    return new Blob([decodeURIComponent(encoded)], { type: mime });
  } catch {
    return new Blob(['placeholder'], { type: fallbackMime });
  }
}

export interface TriggerDownloadOptions {
  mimeType?: string;
  asBase64?: boolean;
}

export function triggerDownload(
  fileName: string,
  contents: string | BlobPart[],
  opts: TriggerDownloadOptions = {}
): void {
  try {
    const mime = opts.mimeType || inferMimeFromName(fileName) || 'application/octet-stream';
    let blob: Blob;
    if (opts.asBase64 && typeof contents === 'string') {
      blob = dataUrlToBlob(contents, mime);
    } else if (Array.isArray(contents)) {
      blob = new Blob(contents, { type: mime });
    } else {
      blob = new Blob([contents], { type: mime });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  } catch (err) {
    console.error('triggerDownload failed', err);
  }
}

export function sanitizeFileName(name: string, fallback = 'download.txt'): string {
  if (!name) return fallback;
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '_').trim();
  return cleaned || fallback;
}
