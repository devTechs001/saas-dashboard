// Marketing content — real copy for the public landing pages and /pricing.
// This ships to production (it is product copy, not fake customer data).


export const plans = [
  {
    id: 'starter', name: 'Starter', price: 29, period: 'mo', tagline: 'For small teams getting started',
    features: ['Up to 5 team members', '10k events / month', 'Basic analytics', 'Email support'], current: false,
  },
  {
    id: 'pro', name: 'Pro', price: 99, period: 'mo', tagline: 'For growing companies',
    features: ['Up to 25 team members', '250k events / month', 'Advanced analytics & reports', 'AI insights (basic)', 'Priority support'], current: false,
  },
  {
    id: 'business', name: 'Business', price: 249, period: 'mo', tagline: 'For scaling organizations',
    features: ['Unlimited team members', '2M events / month', 'Custom reports & exports', 'AI insights + anomaly alerts', 'SSO & audit logs', 'Dedicated CSM'], current: false,
  },
  {
    id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '', tagline: 'For enterprises with advanced needs',
    features: ['Everything in Business', 'Unlimited events', 'Custom SLAs & contracts', 'On-prem / VPC options', 'Security reviews & BAA', '24/7 premium support'], current: true,
  },
];


export const testimonials = [
  { name: 'Sofia Alvarez', role: 'VP Revenue Ops, Helios Retail', quote: 'We replaced four tools with this platform. The AI churn alerts alone paid for the subscription in the first month.' },
  { name: 'Daniel Kim', role: 'CTO, Nimbus Labs', quote: 'The analytics pipeline is fast and the API is a joy to integrate. Our dashboards load in under a second.' },
  { name: 'Grace Mensah', role: 'Head of Growth, Bluewave Media', quote: 'Beautiful product, serious depth. Onboarding our team took a single afternoon.' },
];


export const clientLogos = ['Acme Corp', 'Nimbus Labs', 'Helios Retail', 'Vertex Health', 'Bluewave', 'Orbit Logistics'];


export const faqs = [
  { q: 'How long does onboarding take?', a: 'Most teams are live within a day. Import your customers, connect your data sources, and the dashboards populate automatically.' },
  { q: 'Is my data isolated from other tenants?', a: 'Yes. Every record is scoped to your organization, enforced at every layer of the stack — gateway, API, and database.' },
  { q: 'Can I export my data?', a: 'Any report can be exported as CSV, XLSX, or PDF, and full raw exports are available on Business and Enterprise plans.' },
  { q: 'Do you offer SSO and audit logs?', a: 'SSO (SAML/OIDC) and full audit logging are included on the Business plan and above.' },
];


export const featureCards = [
  { icon: 'analytics', title: 'Real-time Analytics', desc: 'Sub-second dashboards with funnels, cohorts, and custom metrics that update live.' },
  { icon: 'ai', title: 'AI Copilot & Insights', desc: 'Anomaly detection, churn risk scoring, and revenue forecasting built on your data.' },
  { icon: 'crm', title: 'CRM & Pipelines', desc: 'Customers, deals, and health scores in one workspace your whole team shares.' },
  { icon: 'team', title: 'Team Collaboration', desc: 'Shared boards, threads, mentions, and activity feeds — decisions stay in context.' },
  { icon: 'reports', title: 'Reports & Exports', desc: 'Scheduled PDF/XLSX reports delivered to inboxes, Slack, or your data warehouse.' },
  { icon: 'shield', title: 'Enterprise Security', desc: 'RBAC, SSO, audit logs, and SOC 2-ready controls out of the box.' },
  { icon: 'billing', title: 'Billing & Subscriptions', desc: 'Plans, invoices, and usage-based billing with an auditable ledger.' },
  { icon: 'code', title: 'Developer Platform', desc: 'REST + webhooks, API keys, and SDKs. Everything in the UI is API-first.' },
  { icon: 'theme', title: 'Themes & Personalization', desc: 'Light/dark themes, accent colors, and configurable dashboards per user.' },
];


export const statsBar = [
  { value: '99.98%', label: 'Uptime' },
  { value: '12M+', label: 'Events / day' },
  { value: '4,200+', label: 'Teams' },
  { value: '<1s', label: 'Dashboard load' },
];
