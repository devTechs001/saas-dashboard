// SAMPLE DATA — dev builds only.
//
// These exported values describe an imaginary workspace (KPIs, traffic series,
// customers, teammates, invoices…). Pages read them through a
// `DEMO_AVAILABLE ? mockX : []` ternary in `src/config/env`, which Vite turns
// into a compile-time constant, so this entire module is dropped from
// production bundles. Nothing here may be shown to a real user.
//
// Shapes mirror docs/api so swapping to the real endpoints is a drop-in change.

// Static content + sample dataset for the front end.
//
//  • Marketing content (plans, FAQs, testimonials, feature copy) is real copy
//    and is imported directly by the landing pages and /pricing.
//  • Everything else is *sample* data (kpis, series, customers, users…).
//    It must only ever reach the UI behind `DEMO_AVAILABLE`, which
//    is false in production builds so the sample data is tree-shaken away.
//
// Shapes mirror docs/api so swapping to the real endpoints is a drop-in change.

export const kpis = {
  mrr: { value: 84230, delta: 12.4 },
  activeUsers: { value: 24891, delta: 8.1 },
  conversion: { value: 3.82, delta: -0.6 },
  churn: { value: 1.9, delta: -0.3 },
  arr: { value: 1010760, delta: 15.2 },
  nps: { value: 62, delta: 4 },
};


export const revenueSeries = [
  { month: 'Jan', revenue: 41200, expenses: 26100, subscriptions: 320 },
  { month: 'Feb', revenue: 44800, expenses: 27400, subscriptions: 348 },
  { month: 'Mar', revenue: 48100, expenses: 28900, subscriptions: 372 },
  { month: 'Apr', revenue: 52600, expenses: 30200, subscriptions: 401 },
  { month: 'May', revenue: 57200, expenses: 31800, subscriptions: 436 },
  { month: 'Jun', revenue: 55400, expenses: 32500, subscriptions: 428 },
  { month: 'Jul', revenue: 61800, expenses: 33100, subscriptions: 467 },
  { month: 'Aug', revenue: 66200, expenses: 34800, subscriptions: 498 },
  { month: 'Sep', revenue: 69400, expenses: 35200, subscriptions: 523 },
  { month: 'Oct', revenue: 74100, expenses: 36900, subscriptions: 561 },
  { month: 'Nov', revenue: 79800, expenses: 38200, subscriptions: 597 },
  { month: 'Dec', revenue: 84230, expenses: 39500, subscriptions: 634 },
];


export const trafficSeries = Array.from({ length: 30 }, (_, i) => {
  const day = new Date(Date.now() - (29 - i) * 86400000);
  const base = 2400 + Math.sin(i / 3) * 500 + i * 28;
  return {
    date: day.toISOString().slice(0, 10),
    visitors: Math.round(base + (i % 7 === 0 ? -320 : 140)),
    pageViews: Math.round(base * 2.7 + (i % 5 === 0 ? 500 : 0)),
    signups: Math.round(base / 22 + (i % 9 === 0 ? 14 : 2)),
  };
});


export const deviceBreakdown = [
  { name: 'Desktop', value: 54, color: '#4F46E5' },
  { name: 'Mobile', value: 33, color: '#0EA5E9' },
  { name: 'Tablet', value: 9, color: '#34D399' },
  { name: 'Other', value: 4, color: '#F59E0B' },
];


export const trafficSources = [
  { name: 'Organic Search', value: 41200 },
  { name: 'Direct', value: 28900 },
  { name: 'Referral', value: 17600 },
  { name: 'Social', value: 13200 },
  { name: 'Email', value: 8900 },
  { name: 'Paid Ads', value: 6400 },
];


export const revenueByPlan = [
  { name: 'Enterprise', value: 42100, color: '#4F46E5' },
  { name: 'Business', value: 24800, color: '#0EA5E9' },
  { name: 'Pro', value: 12600, color: '#34D399' },
  { name: 'Starter', value: 4730, color: '#F59E0B' },
];


export const funnel = [
  { stage: 'Visitors', value: 48200 },
  { stage: 'Sign-ups', value: 9640 },
  { stage: 'Activated', value: 5120 },
  { stage: 'Subscribed', value: 1840 },
  { stage: 'Renewed', value: 1290 },
];


export const cohort = [
  { cohort: 'Jun', size: 412, retention: [100, 68, 54, 47, 42, 39] },
  { cohort: 'Jul', size: 467, retention: [100, 71, 57, 49, 44, 0] },
  { cohort: 'Aug', size: 498, retention: [100, 73, 61, 52, 0, 0] },
  { cohort: 'Sep', size: 523, retention: [100, 76, 64, 0, 0, 0] },
  { cohort: 'Oct', size: 561, retention: [100, 78, 0, 0, 0, 0] },
  { cohort: 'Nov', size: 597, retention: [100, 0, 0, 0, 0, 0] },
];


export const topPages = [
  { path: '/dashboard', views: 18420, avgTime: '4m 32s', bounce: 21 },
  { path: '/pricing', views: 12870, avgTime: '2m 18s', bounce: 38 },
  { path: '/features', views: 9640, avgTime: '3m 05s', bounce: 33 },
  { path: '/blog/saas-metrics', views: 7210, avgTime: '6m 11s', bounce: 27 },
  { path: '/docs/getting-started', views: 6890, avgTime: '5m 47s', bounce: 19 },
];


export const goals = [
  { label: 'Q4 Revenue target', current: 84230, target: 100000, unit: '$' },
  { label: 'New sign-ups', current: 1840, target: 2500, unit: '' },
  { label: 'NPS ≥ 60', current: 62, target: 60, unit: '' },
];


export const customers = [
  { id: 'cus_1', name: 'Acme Corp', email: 'ops@acme.com', company: 'Acme Corp', status: 'active', value: 48200, plan: 'Enterprise', owner: 'Maya Chen', lastActive: '2026-11-03T09:12:00Z', tags: ['fintech', 'strategic'], country: 'US' },
  { id: 'cus_2', name: 'Nimbus Labs', email: 'team@nimbuslabs.io', company: 'Nimbus Labs', status: 'active', value: 26400, plan: 'Business', owner: 'Jordan Lee', lastActive: '2026-11-02T17:40:00Z', tags: ['saas'], country: 'DE' },
  { id: 'cus_3', name: 'Helios Retail', email: 'it@heliosretail.com', company: 'Helios Retail', status: 'active', value: 19100, plan: 'Business', owner: 'Maya Chen', lastActive: '2026-11-01T11:05:00Z', tags: ['retail'], country: 'KE' },
  { id: 'cus_4', name: 'Quantiva', email: 'billing@quantiva.ai', company: 'Quantiva', status: 'lead', value: 0, plan: '—', owner: 'Sam Okoro', lastActive: '2026-10-30T14:22:00Z', tags: ['ai', 'lead'], country: 'GB' },
  { id: 'cus_5', name: 'Bluewave Media', email: 'hello@bluewave.tv', company: 'Bluewave Media', status: 'active', value: 12400, plan: 'Pro', owner: 'Jordan Lee', lastActive: '2026-10-29T08:55:00Z', tags: ['media'], country: 'BR' },
  { id: 'cus_6', name: 'Orbit Logistics', email: 'ops@orbitlog.com', company: 'Orbit Logistics', status: 'churned', value: 8300, plan: 'Pro', owner: 'Maya Chen', lastActive: '2026-09-18T16:30:00Z', tags: ['logistics'], country: 'IN' },
  { id: 'cus_7', name: 'Vertex Health', email: 'data@vertexhealth.com', company: 'Vertex Health', status: 'active', value: 31200, plan: 'Enterprise', owner: 'Sam Okoro', lastActive: '2026-11-03T07:45:00Z', tags: ['health'], country: 'US' },
  { id: 'cus_8', name: 'Lumen Studio', email: 'studio@lumen.design', company: 'Lumen Studio', status: 'inactive', value: 4200, plan: 'Starter', owner: 'Jordan Lee', lastActive: '2026-10-11T10:15:00Z', tags: ['design'], country: 'FR' },
];


export const teamMembers = [
  { id: 'usr_1', name: 'Ava Mitchell', email: 'ava@nexus.io', role: 'admin', title: 'CEO & Co-founder', status: 'online', tasksDone: 128, location: 'Nairobi, KE' },
  { id: 'usr_2', name: 'Maya Chen', email: 'maya@nexus.io', role: 'admin', title: 'Head of Sales', status: 'online', tasksDone: 214, location: 'San Francisco, US' },
  { id: 'usr_3', name: 'Jordan Lee', email: 'jordan@nexus.io', role: 'manager', title: 'Customer Success Lead', status: 'away', tasksDone: 187, location: 'Toronto, CA' },
  { id: 'usr_4', name: 'Sam Okoro', email: 'sam@nexus.io', role: 'manager', title: 'Account Executive', status: 'online', tasksDone: 156, location: 'Lagos, NG' },
  { id: 'usr_5', name: 'Priya Nair', email: 'priya@nexus.io', role: 'viewer', title: 'Data Analyst', status: 'offline', tasksDone: 92, location: 'Bengaluru, IN' },
  { id: 'usr_6', name: 'Luca Rossi', email: 'luca@nexus.io', role: 'viewer', title: 'Support Engineer', status: 'online', tasksDone: 143, location: 'Milan, IT' },
];


export const platformUsers = [
  ...teamMembers,
  { id: 'usr_7', name: 'Nadia Haddad', email: 'nadia@acme.com', role: 'viewer', title: 'Acme — Ops', status: 'offline', tasksDone: 12, location: 'Dubai, AE' },
  { id: 'usr_8', name: 'Tom Becker', email: 'tom@nimbuslabs.io', role: 'manager', title: 'Nimbus — CTO', status: 'away', tasksDone: 45, location: 'Berlin, DE' },
];


export const tasks = {
  todo: [
    { id: 'tsk_1', title: 'Q4 enterprise renewal deck', assignee: 'Maya Chen', priority: 'high', due: '2026-11-08', tag: 'sales' },
    { id: 'tsk_2', title: 'Onboarding flow for Helios', assignee: 'Jordan Lee', priority: 'medium', due: '2026-11-12', tag: 'success' },
    { id: 'tsk_3', title: 'Pricing experiment: annual toggle', assignee: 'Priya Nair', priority: 'low', due: '2026-11-20', tag: 'growth' },
  ],
  inProgress: [
    { id: 'tsk_4', title: 'Vertex Health expansion proposal', assignee: 'Sam Okoro', priority: 'high', due: '2026-11-06', tag: 'sales' },
    { id: 'tsk_5', title: 'NPS survey automation', assignee: 'Priya Nair', priority: 'medium', due: '2026-11-15', tag: 'growth' },
  ],
  done: [
    { id: 'tsk_6', title: 'Migrate billing to new ledger', assignee: 'Ava Mitchell', priority: 'high', due: '2026-10-28', tag: 'platform' },
    { id: 'tsk_7', title: 'October churn review', assignee: 'Maya Chen', priority: 'medium', due: '2026-10-31', tag: 'success' },
    { id: 'tsk_8', title: 'SOC 2 evidence collection', assignee: 'Luca Rossi', priority: 'high', due: '2026-10-25', tag: 'platform' },
  ],
};


export const activityFeed = [
  { id: 'act_1', type: 'deal', actor: 'Maya Chen', text: 'closed <b>Acme Corp</b> renewal — $48,200 ARR', time: '2026-11-03T09:30:00Z' },
  { id: 'act_2', type: 'report', actor: 'Priya Nair', text: 'generated <b>October revenue report</b>', time: '2026-11-03T08:12:00Z' },
  { id: 'act_3', type: 'user', actor: 'System', text: '<b>Nadia Haddad</b> joined the Acme workspace', time: '2026-11-02T19:44:00Z' },
  { id: 'act_4', type: 'ai', actor: 'AI Assistant', text: 'flagged a <b>churn risk</b> on Orbit Logistics', time: '2026-11-02T15:02:00Z' },
  { id: 'act_5', type: 'deploy', actor: 'Luca Rossi', text: 'shipped <b>analytics-service v1.4.0</b> to production', time: '2026-11-02T11:20:00Z' },
  { id: 'act_6', type: 'billing', actor: 'System', text: 'invoice <b>#INV-2041</b> paid — $2,400', time: '2026-11-01T16:35:00Z' },
];


export const chatChannels = [
  { id: 'gen', name: 'general', unread: 2 },
  { id: 'sales', name: 'sales-wins', unread: 5 },
  { id: 'eng', name: 'engineering', unread: 0 },
  { id: 'cs', name: 'customer-success', unread: 1 },
  { id: 'random', name: 'random', unread: 0 },
];


export const chatMessages = {
  gen: [
    { id: 'm1', user: 'Maya Chen', text: 'Morning all — big week, three renewals on the table ☕', time: '09:02' },
    { id: 'm2', user: 'Jordan Lee', text: 'Helios kickoff went great. They want the analytics add-on.', time: '09:14' },
    { id: 'm3', user: 'Ava Mitchell', text: 'Love it. Let’s capture that in the expansion board.', time: '09:18' },
    { id: 'm4', user: 'Sam Okoro', text: 'Sharing the Vertex proposal draft after standup.', time: '09:41' },
  ],
  sales: [
    { id: 'm5', user: 'Maya Chen', text: 'Acme renewal signed 🎉 $48.2k ARR', time: '08:30' },
    { id: 'm6', user: 'Priya Nair', text: 'That’s 112% of the Q4 target trajectory!', time: '08:35' },
    { id: 'm7', user: 'Luca Rossi', text: 'Congrats team!!', time: '08:36' },
  ],
  eng: [
    { id: 'm8', user: 'Luca Rossi', text: 'Gateway benchmarks: p99 1.2ms — nice.', time: 'Yesterday' },
    { id: 'm9', user: 'Ava Mitchell', text: 'Below our 2ms SLO target. Ship it.', time: 'Yesterday' },
  ],
  cs: [
    { id: 'm10', user: 'Jordan Lee', text: 'Orbit Logistics flagged churn risk by the AI model (0.82).', time: '11:20' },
  ],
  random: [
    { id: 'm11', user: 'Priya Nair', text: 'Anyone up for the Friday chess bracket? ♟️', time: 'Yesterday' },
  ],
};


export const aiInsights = [
  { id: 'ins_1', type: 'opportunity', title: 'Upsell opportunity: Nimbus Labs', detail: 'Usage is at 91% of the Business plan quota. Reaching out before the limit could convert them to Enterprise (~+$18k ARR).', confidence: 0.87 },
  { id: 'ins_2', type: 'risk', title: 'Churn risk: Orbit Logistics', detail: 'Login frequency down 64% over 21 days and two support tickets escalated. Suggested action: success call this week.', confidence: 0.82 },
  { id: 'ins_3', type: 'trend', title: 'Revenue forecast on track', detail: 'Based on the last 12 months, December MRR is projected at $86.5k–$89.1k (±2.3%).', confidence: 0.78 },
  { id: 'ins_4', type: 'anomaly', title: 'Traffic spike on /pricing', detail: 'Referral traffic +218% since Monday, mostly from dev communities. Consider fast-tracking the self-serve signup experiment.', confidence: 0.91 },
];


export const invoices = [
  { id: 'INV-2041', date: '2026-11-01', amount: 2400, status: 'paid', plan: 'Enterprise', period: 'Nov 2026' },
  { id: 'INV-2032', date: '2026-10-01', amount: 2400, status: 'paid', plan: 'Enterprise', period: 'Oct 2026' },
  { id: 'INV-2023', date: '2026-09-01', amount: 2400, status: 'paid', plan: 'Enterprise', period: 'Sep 2026' },
  { id: 'INV-2014', date: '2026-08-01', amount: 1980, status: 'paid', plan: 'Business', period: 'Aug 2026' },
  { id: 'INV-2005', date: '2026-07-01', amount: 1980, status: 'paid', plan: 'Business', period: 'Jul 2026' },
];


export const usage = [
  { label: 'API calls', used: 684210, quota: 2000000 },
  { label: 'Events ingested', used: 1248000, quota: 2000000 },
  { label: 'Team seats', used: 6, quota: '∞' },
  { label: 'Report generations', used: 84, quota: 500 },
];


export const apiKeys = [
  { id: 'key_1', name: 'Production', prefix: 'sk_live_8f2a…c91d', created: '2026-06-14', lastUsed: '2026-11-03T09:58:00Z', scope: 'full' },
  { id: 'key_2', name: 'Staging', prefix: 'sk_test_3b7e…44a2', created: '2026-06-14', lastUsed: '2026-11-02T22:10:00Z', scope: 'read' },
  { id: 'key_3', name: 'Local dev', prefix: 'sk_test_91cc…0e5f', created: '2026-09-02', lastUsed: '2026-10-28T12:00:00Z', scope: 'read' },
];


export const webhooks = [
  { id: 'wh_1', url: 'https://api.acme.com/hooks/saas', events: ['invoice.paid', 'user.created'], status: 'active', lastDelivery: '2026-11-03T09:31:00Z' },
  { id: 'wh_2', url: 'https://staging.acme.com/hooks/saas', events: ['*'], status: 'paused', lastDelivery: '2026-10-30T18:02:00Z' },
];


export const notifications = [
  { id: 'not_1', title: 'Payment received', message: 'Invoice #INV-2041 paid — $2,400.00', type: 'billing', read: false, time: '2026-11-03T09:35:00Z' },
  { id: 'not_2', title: 'AI churn alert', message: 'Orbit Logistics churn risk increased to 0.82', type: 'ai', read: false, time: '2026-11-02T15:02:00Z' },
  { id: 'not_3', title: 'New team member', message: 'Nadia Haddad joined your workspace', type: 'user', read: false, time: '2026-11-02T19:44:00Z' },
  { id: 'not_4', title: 'Report ready', message: 'October revenue report is ready to download', type: 'report', read: true, time: '2026-11-01T08:12:00Z' },
  { id: 'not_5', title: 'Deploy succeeded', message: 'analytics-service v1.4.0 deployed to production', type: 'deploy', read: true, time: '2026-11-02T11:20:00Z' },
  { id: 'not_6', title: 'Weekly digest', message: 'Your weekly performance digest is available', type: 'system', read: true, time: '2026-11-01T07:00:00Z' },
];


export const reports = [
  { id: 'rep_1', title: 'October Revenue Report', type: 'revenue', status: 'ready', createdAt: '2026-11-01T08:12:00Z', size: '2.4 MB', format: 'PDF' },
  { id: 'rep_2', title: 'Q3 Cohort Analysis', type: 'cohort', status: 'ready', createdAt: '2026-10-12T10:30:00Z', size: '5.1 MB', format: 'XLSX' },
  { id: 'rep_3', title: 'Traffic & Acquisition', type: 'traffic', status: 'generating', createdAt: '2026-11-03T09:50:00Z', size: '—', format: 'PDF' },
  { id: 'rep_4', title: 'Customer Health Overview', type: 'customers', status: 'ready', createdAt: '2026-10-28T14:45:00Z', size: '1.8 MB', format: 'CSV' },
  { id: 'rep_5', title: 'Churn Deep-Dive', type: 'customers', status: 'failed', createdAt: '2026-10-20T09:00:00Z', size: '—', format: 'PDF' },
];
