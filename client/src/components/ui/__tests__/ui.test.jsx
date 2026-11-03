import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusChip, RoleChip, MetricDelta, EmptyState, KpiCard } from '../index';

describe('UI kit components', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders StatusChip labels for known statuses', () => {
    render(<StatusChip status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders RoleChip with the human-readable role', () => {
    render(<RoleChip role="admin" />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    render(<RoleChip role="viewer" />);
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('renders MetricDelta with a signed percent', () => {
    render(<MetricDelta value={12.4} />);
    expect(screen.getByText('+12.4% vs last period')).toBeInTheDocument();
    render(<MetricDelta value={-0.6} />);
    expect(screen.getByText('-0.6% vs last period')).toBeInTheDocument();
  });

  it('renders EmptyState with title and message', () => {
    render(<EmptyState title="Nothing here yet" message="Try again later" />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    expect(screen.getByText('Try again later')).toBeInTheDocument();
  });

  it('renders KpiCard with label and value', () => {
    render(<KpiCard label="Monthly recurring revenue" value="$84,230" />);
    expect(screen.getByText('Monthly recurring revenue')).toBeInTheDocument();
    expect(screen.getByText('$84,230')).toBeInTheDocument();
  });
});
