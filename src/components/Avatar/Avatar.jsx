import React from 'react';
import getBlobUrl from '../../utils/blob';

const Avatar = ({ src, alt = 'avatar', size = 40, className = '', border = true, children, ...rest }) => {
  const url = getBlobUrl(src) || src || null;

  const baseClass = `rounded-full object-cover ${className}`;
  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : {};

  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        className={`${baseClass} ${border ? 'border-2 border-red-500' : ''}`}
        style={sizeStyle}
        {...rest}
      />
    );
  }

  // Fallback: show initials or a default placeholder
  const initials = typeof alt === 'string' && alt.length ? alt.split(' ').map(s => s[0]).slice(0,2).join('') : '';
  return (
    <div className={`${baseClass} flex items-center justify-center bg-gray-200 text-gray-700`} style={{ ...sizeStyle }} {...rest}>
      {initials || children || '🖼'}
    </div>
  );
};

// No explicit PropTypes to avoid dependency on `prop-types` in this project by default.

export default Avatar;
