import React from 'react';

/**
 * Renders text containing simple <b>…</b> emphasis markers as real React
 * elements. This replaces `dangerouslySetInnerHTML` throughout the app so
 * untrusted content can never inject markup (XSS hardening).
 */
const BOLD_RE = /<b>(.*?)<\/b>/g;

export const SafeText = ({ text = '' }) => {
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  BOLD_RE.lastIndex = 0;
  while ((match = BOLD_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`t${key++}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(<b key={`b${key++}`}>{match[1]}</b>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={`t${key++}`}>{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
};

/** Strip any remaining HTML tags defensively (for plain text contexts). */
export const stripTags = (text = '') => {
  const src = typeof text === 'string' ? text : '';
  return src.replace(/<[^>]*>/g, '');
};

export default SafeText;
