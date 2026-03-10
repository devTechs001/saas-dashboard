import Analytics from '../models/Analytics.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getDashboardStats = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const tenantId = req.tenantId;

  const query = { tenantId };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query.date = { $gte: thirtyDaysAgo };
  }

  const analytics = await Analytics.find(query).sort({ date: 1 });

  const totals = analytics.reduce(
    (acc, curr) => ({
      pageViews: acc.pageViews + curr.pageViews,
      uniqueVisitors: acc.uniqueVisitors + curr.uniqueVisitors,
      sessions: acc.sessions + curr.sessions,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
    }),
    { pageViews: 0, uniqueVisitors: 0, sessions: 0, conversions: 0, revenue: 0 }
  );

  const avgBounceRate =
    analytics.reduce((acc, curr) => acc + curr.bounceRate, 0) /
    (analytics.length || 1);

  const avgSessionDuration =
    analytics.reduce((acc, curr) => acc + curr.avgSessionDuration, 0) /
    (analytics.length || 1);

  const previousPeriodQuery = { tenantId };
  const daysCount = analytics.length || 30;
  const prevStartDate = new Date(query.date.$gte || new Date());
  prevStartDate.setDate(prevStartDate.getDate() - daysCount);
  const prevEndDate = new Date(query.date.$gte || new Date());
  prevEndDate.setDate(prevEndDate.getDate() - 1);
  previousPeriodQuery.date = { $gte: prevStartDate, $lte: prevEndDate };

  const previousAnalytics = await Analytics.find(previousPeriodQuery);
  const previousTotals = previousAnalytics.reduce(
    (acc, curr) => ({
      pageViews: acc.pageViews + curr.pageViews,
      uniqueVisitors: acc.uniqueVisitors + curr.uniqueVisitors,
      sessions: acc.sessions + curr.sessions,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
    }),
    { pageViews: 0, uniqueVisitors: 0, sessions: 0, conversions: 0, revenue: 0 }
  );

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  res.json(
    ApiResponse.success({
      totals: {
        pageViews: totals.pageViews,
        uniqueVisitors: totals.uniqueVisitors,
        sessions: totals.sessions,
        conversions: totals.conversions,
        revenue: totals.revenue,
        avgBounceRate: Math.round(avgBounceRate * 100) / 100,
        avgSessionDuration: Math.round(avgSessionDuration),
      },
      growth: {
        pageViews: calculateGrowth(totals.pageViews, previousTotals.pageViews),
        uniqueVisitors: calculateGrowth(totals.uniqueVisitors, previousTotals.uniqueVisitors),
        sessions: calculateGrowth(totals.sessions, previousTotals.sessions),
        conversions: calculateGrowth(totals.conversions, previousTotals.conversions),
        revenue: calculateGrowth(totals.revenue, previousTotals.revenue),
      },
      chartData: analytics.map((a) => ({
        date: a.date,
        pageViews: a.pageViews,
        uniqueVisitors: a.uniqueVisitors,
        sessions: a.sessions,
        conversions: a.conversions,
        revenue: a.revenue,
      })),
    })
  );
});

export const getAnalyticsByDate = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const tenantId = req.tenantId;

  const query = { tenantId };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const analytics = await Analytics.find(query).sort({ date: -1 });

  res.json(ApiResponse.success({ analytics }));
});

export const getTopPages = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;
  const tenantId = req.tenantId;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const analytics = await Analytics.find({
    tenantId,
    date: { $gte: thirtyDaysAgo },
  });

  const pageMap = new Map();
  analytics.forEach((a) => {
    a.topPages?.forEach((page) => {
      const current = pageMap.get(page.path) || 0;
      pageMap.set(page.path, current + page.views);
    });
  });

  const topPages = Array.from(pageMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, parseInt(limit));

  res.json(ApiResponse.success({ topPages }));
});

export const getDeviceBreakdown = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const tenantId = req.tenantId;

  const query = { tenantId };
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const analytics = await Analytics.find(query);

  const totals = analytics.reduce(
    (acc, curr) => ({
      desktop: acc.desktop + (curr.devices?.desktop || 0),
      mobile: acc.mobile + (curr.devices?.mobile || 0),
      tablet: acc.tablet + (curr.devices?.tablet || 0),
    }),
    { desktop: 0, mobile: 0, tablet: 0 }
  );

  const total = totals.desktop + totals.mobile + totals.tablet || 1;

  res.json(
    ApiResponse.success({
      devices: {
        desktop: { count: totals.desktop, percentage: (totals.desktop / total) * 100 },
        mobile: { count: totals.mobile, percentage: (totals.mobile / total) * 100 },
        tablet: { count: totals.tablet, percentage: (totals.tablet / total) * 100 },
      },
    })
  );
});

export const createAnalytics = catchAsync(async (req, res) => {
  const analyticsData = {
    ...req.body,
    tenantId: req.tenantId,
  };

  const analytics = await Analytics.create(analyticsData);
  res.status(201).json(
    ApiResponse.success({ analytics }, 'Analytics data created', 201)
  );
});
