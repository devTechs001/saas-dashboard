import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '../services';

export const useDashboardStats = (params = {}) => {
  return useQuery({
    queryKey: ['dashboardStats', params],
    queryFn: () => analyticsService.getDashboardStats(params),
    select: (data) => data.data,
  });
};

export const useAnalyticsByDate = (params = {}) => {
  return useQuery({
    queryKey: ['analytics', params],
    queryFn: () => analyticsService.getByDate(params),
    select: (data) => data.data.analytics,
  });
};

export const useTopPages = (limit = 10) => {
  return useQuery({
    queryKey: ['topPages', limit],
    queryFn: () => analyticsService.getTopPages(limit),
    select: (data) => data.data.topPages,
  });
};

export const useDeviceBreakdown = (params = {}) => {
  return useQuery({
    queryKey: ['deviceBreakdown', params],
    queryFn: () => analyticsService.getDeviceBreakdown(params),
    select: (data) => data.data.devices,
  });
};
