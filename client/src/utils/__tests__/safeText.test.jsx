import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SafeText, stripTags } from '../safeText';

describe('SafeText', () => {
  it('renders plain text unchanged', () => {
    render(<SafeText text="hello world" />);
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('renders <b> markers as real bold elements, not markup', () => {
    const { container } = render(<SafeText text="closed <b>Acme Corp</b> renewal" />);
    const bold = container.querySelector('b');
    expect(bold).not.toBeNull();
    expect(bold.textContent).toBe('Acme Corp');
    // The raw tag must never appear as text content
    expect(container.textContent).toBe('closed Acme Corp renewal');
  });

  it('handles multiple bold segments and empty input', () => {
    const { container } = render(<SafeText text="<b>a</b> and <b>b</b>" />);
    expect(container.querySelectorAll('b').length).toBe(2);
    render(<SafeText />);
  });

  it('does not execute injected HTML (XSS hardening)', () => {
    const evil = '<img src=x onerror="alert(1)" /><script>alert(2)</script>';
    const { container } = render(<SafeText text={evil} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toBe(evil);
  });
});

describe('stripTags', () => {
  it('removes HTML tags', () => {
    expect(stripTags('<b>bold</b> text')).toBe('bold text');
    expect(stripTags('<script>alert(1)</script>')).toBe('alert(1)');
    expect(stripTags('plain')).toBe('plain');
  });
});
