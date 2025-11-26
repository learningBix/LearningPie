import { BLOB_BASE_URL } from '../config/api';

// Normalize and build a full blob URL for images/videos stored in blob storage.
// If `path` is already a full URL (starts with http), return as-is.
// If `path` contains upload folder segments (e.g. '/public/uploads/' or '/uploads/'),
// extract the filename and append it to the blob base URL.
export const getBlobUrl = (path) => {
  if (!path) return null;
  const trimmed = String(path).trim();
  if (trimmed === '') return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // If path contains folder segments, use the filename only for blob URL
  const filename = trimmed.split('/').pop();
  if (!filename) return null;

  // Ensure single slash between base and filename
  const base = BLOB_BASE_URL || '';
  return base.endsWith('/') ? `${base}${filename}` : `${base}/${filename}`;
};

export default getBlobUrl;
