/**
 * Subscription API — plans, current subscription, upgrades, seats, cancel,
 * and invoice history. Real HTTP CRUD backed by the in-memory store.
 */
import { memoryStore as store, PLANS } from '../store/memoryStore.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/apiError.js';

const userId = (req) => String(req.user?.id ?? req.user?._id ?? '');

const findPlan = (planId) => PLANS.find((p) => p.id === planId) || null;

const currentSubscription = (req) =>
  store.db.subscriptions.find((s) => s.userId === userId(req)) || null;

const decorate = (sub) => {
  const plan = sub ? findPlan(sub.planId) : null;
  return sub ? { ...sub, plan } : null;
};

export const getPlans = catchAsync(async (req, res) => {
  res.json(ApiResponse.success({ plans: PLANS }));
});

export const getCurrent = catchAsync(async (req, res) => {
  const sub = currentSubscription(req);
  res.json(
    ApiResponse.success({
      subscription: decorate(sub),
      plan: sub ? findPlan(sub.planId) : null,
    })
  );
});

export const subscribe = catchAsync(async (req, res) => {
  const { planId, seats } = req.body;
  const plan = findPlan(planId);
  if (!plan) throw ApiError.notFound(`Plan "${planId}" not found`);
  if (plan.price === null) throw ApiError.badRequest('Enterprise plans are handled by sales — contact us');

  const seatCount = Math.max(1, Math.min(parseInt(seats, 10) || plan.seats || 1, 999));
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 86400000);
  const existing = currentSubscription(req);

  if (existing) {
    // Plan switch: proration is out of scope — the period resets.
    existing.planId = plan.id;
    existing.seats = seatCount;
    existing.status = 'active';
    existing.cancelAtPeriodEnd = false;
    existing.currentPeriodStart = now.toISOString();
    existing.currentPeriodEnd = periodEnd.toISOString();
    store.logAudit({
      actor: req.user?.name || 'User',
      action: `Switched plan → ${plan.name} (${seatCount} seats)`,
      target: existing.id,
      type: 'billing',
    });
    store.db.invoices.unshift({
      id: `INV-${2100 + store.db.invoices.length}`,
      userId: userId(req),
      amount: plan.price * seatCount,
      status: 'paid',
      date: now.toISOString().slice(0, 10),
      planId: plan.id,
      seats: seatCount,
    });
    res.json(ApiResponse.success({ subscription: decorate(existing) }, `Subscribed to ${plan.name}`));
    return;
  }

  const sub = {
    id: store.uid('sub'),
    userId: userId(req),
    planId: plan.id,
    status: 'active',
    seats: seatCount,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    cancelAtPeriodEnd: false,
    createdAt: now.toISOString(),
  };
  store.db.subscriptions.push(sub);
  store.db.invoices.unshift({
    id: `INV-${2100 + store.db.invoices.length}`,
    userId: userId(req),
    amount: plan.price * seatCount,
    status: 'paid',
    date: now.toISOString().slice(0, 10),
    planId: plan.id,
    seats: seatCount,
  });
  store.logAudit({
    actor: req.user?.name || 'User',
    action: `Subscribed to ${plan.name} (${seatCount} seats)`,
    target: sub.id,
    type: 'billing',
  });
  res.status(201).json(ApiResponse.success({ subscription: decorate(sub) }, `Subscribed to ${plan.name}`, 201));
});

export const updateSubscription = catchAsync(async (req, res) => {
  const sub = currentSubscription(req);
  if (!sub) throw ApiError.notFound('No active subscription');
  const { seats, cancelAtPeriodEnd } = req.body;
  if (seats !== undefined) {
    const seatCount = Math.max(1, Math.min(parseInt(seats, 10) || 1, 999));
    sub.seats = seatCount;
    store.logAudit({
      actor: req.user?.name || 'User',
      action: `Updated seats → ${seatCount}`,
      target: sub.id,
      type: 'billing',
    });
  }
  if (cancelAtPeriodEnd !== undefined) {
    sub.cancelAtPeriodEnd = Boolean(cancelAtPeriodEnd);
    if (!sub.cancelAtPeriodEnd && sub.status === 'canceled') sub.status = 'active';
    store.logAudit({
      actor: req.user?.name || 'User',
      action: sub.cancelAtPeriodEnd ? 'Scheduled cancellation at period end' : 'Resumed subscription',
      target: sub.id,
      type: 'billing',
    });
  }
  res.json(ApiResponse.success({ subscription: decorate(sub) }, 'Subscription updated'));
});

export const cancelSubscription = catchAsync(async (req, res) => {
  const sub = currentSubscription(req);
  if (!sub) throw ApiError.notFound('No active subscription');
  const immediate = Boolean(req.body?.immediate);
  if (immediate) {
    sub.status = 'canceled';
    sub.cancelAtPeriodEnd = true;
  } else {
    sub.cancelAtPeriodEnd = true;
  }
  store.logAudit({
    actor: req.user?.name || 'User',
    action: immediate ? 'Canceled subscription (immediate)' : 'Canceled at period end',
    target: sub.id,
    type: 'billing',
  });
  res.json(ApiResponse.success({ subscription: decorate(sub) }, immediate ? 'Subscription canceled' : 'Subscription will cancel at period end'));
});

export const getInvoices = catchAsync(async (req, res) => {
  const invoices = store.db.invoices.filter((i) => i.userId === userId(req));
  res.json(ApiResponse.success({ invoices, total: invoices.length }));
});
