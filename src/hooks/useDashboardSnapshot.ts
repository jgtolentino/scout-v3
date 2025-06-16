import { useState, useEffect } from 'react';
import dashboardSpec from '../../specs/dashboard_end_state.yaml?raw';
import yaml from 'js-yaml';

interface Snapshot {
  taken_at: string;
  kpis: {
    total_revenue: number;
    transactions: number;
    avg_order_value: number;
    units_sold: number;
    unique_customers: number;
    gross_margin_pct: number;
  };
}

interface DashboardConfig {
  snapshot?: Snapshot;
}

export const useDashboardSnapshot = () => {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const config = yaml.load(dashboardSpec) as DashboardConfig;
      if (config.snapshot) {
        setSnapshot(config.snapshot);
      }
    } catch (err) {
      console.error('Failed to parse dashboard spec:', err);
      setError('Failed to load dashboard configuration');
    }
  }, []);

  const isLive = (currentValue: number, snapshotValue: number): boolean => {
    if (snapshotValue === 0) return currentValue === 0;
    const diff = Math.abs(currentValue - snapshotValue) / snapshotValue;
    return diff < 0.02; // Within 2% is considered "live"
  };

  const getTimeSinceSnapshot = (): string => {
    if (!snapshot) return '';
    const now = new Date();
    const snapshotDate = new Date(snapshot.taken_at);
    const hours = Math.floor((now.getTime() - snapshotDate.getTime()) / (1000 * 60 * 60));
    
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return {
    snapshot,
    error,
    isLive,
    getTimeSinceSnapshot
  };
};