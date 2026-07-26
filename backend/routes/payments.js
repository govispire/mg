const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// GET /api/plans - List active plans (public)
router.get('/plans', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM plans WHERE is_active = true ORDER BY sort_order ASC, created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /plans error:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// GET /api/subscriptions/me - Get current user's subscription (auth)
router.get('/subscriptions/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, p.display_name AS plan_name, p.description AS plan_description,
              p.monthly_price, p.yearly_price, p.features, p.category_access, p.limits
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /subscriptions/me error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST /api/subscriptions/create - Create subscription order (auth)
router.post('/subscriptions/create', auth, async (req, res) => {
  const { plan_id, billing_cycle } = req.body;

  if (!plan_id || !billing_cycle) {
    return res.status(400).json({ error: 'plan_id and billing_cycle are required' });
  }

  if (!['monthly', 'yearly'].includes(billing_cycle)) {
    return res.status(400).json({ error: 'billing_cycle must be monthly or yearly' });
  }

  try {
    const planResult = await pool.query(
      'SELECT * FROM plans WHERE id = $1 AND is_active = true',
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found or inactive' });
    }

    const plan = planResult.rows[0];
    const amount = billing_cycle === 'monthly' ? plan.monthly_price : plan.yearly_price;

    const razorpay_order_id = `order_mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const payResult = await pool.query(
      `INSERT INTO payments (user_id, amount, currency, status, razorpay_order_id, metadata)
       VALUES ($1, $2, 'INR', 'pending', $3, $4)
       RETURNING *`,
      [req.user.id, amount, razorpay_order_id, JSON.stringify({ plan_id, billing_cycle })]
    );

    res.status(201).json({
      order_id: razorpay_order_id,
      amount,
      currency: 'INR',
      payment: payResult.rows[0],
    });
  } catch (err) {
    console.error('POST /subscriptions/create error:', err);
    res.status(500).json({ error: 'Failed to create subscription order' });
  }
});

// POST /api/subscriptions/verify - Verify payment callback (auth)
router.post('/subscriptions/verify', auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required' });
  }

  try {
    const payResult = await pool.query(
      `SELECT * FROM payments WHERE razorpay_order_id = $1 AND user_id = $2`,
      [razorpay_order_id, req.user.id]
    );

    if (payResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    const payment = payResult.rows[0];

    await pool.query(
      `UPDATE payments
       SET status = 'completed', razorpay_payment_id = $1, razorpay_signature = $2
       WHERE id = $3`,
      [razorpay_payment_id, razorpay_signature, payment.id]
    );

    const meta = payment.metadata || {};
    const plan_id = meta.plan_id;
    const billing_cycle = meta.billing_cycle;

    const now = new Date();
    const expires_at = new Date(now);
    if (billing_cycle === 'yearly') {
      expires_at.setFullYear(expires_at.getFullYear() + 1);
    } else {
      expires_at.setMonth(expires_at.getMonth() + 1);
    }

    await pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, billing_cycle, status, starts_at, expires_at)
       VALUES ($1, $2, $3, 'active', $4, $5)`,
      [req.user.id, plan_id, billing_cycle, now, expires_at]
    );

    res.json({ ok: true, message: 'Payment verified and subscription activated' });
  } catch (err) {
    console.error('POST /subscriptions/verify error:', err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// POST /api/subscriptions/cancel - Cancel subscription (auth)
router.post('/subscriptions/cancel', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE subscriptions SET status = 'cancelled'
       WHERE user_id = $1 AND status = 'active'
       RETURNING *`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    res.json({ ok: true, subscription: result.rows[0] });
  } catch (err) {
    console.error('POST /subscriptions/cancel error:', err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// POST /api/coupons/validate - Validate coupon code (auth)
router.post('/coupons/validate', auth, async (req, res) => {
  const { code, order_amount } = req.body;

  if (!code || order_amount === undefined) {
    return res.status(400).json({ error: 'code and order_amount are required' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND is_active = true`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ valid: false, error: 'Coupon not found or inactive' });
    }

    const coupon = result.rows[0];
    const now = new Date();

    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return res.status(400).json({ valid: false, error: 'Coupon is not yet valid' });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return res.status(400).json({ valid: false, error: 'Coupon has expired' });
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ valid: false, error: 'Coupon usage limit reached' });
    }

    if (coupon.min_order_amount && parseFloat(order_amount) < parseFloat(coupon.min_order_amount)) {
      return res.status(400).json({ valid: false, error: `Minimum order amount is ₹${coupon.min_order_amount}` });
    }

    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = (parseFloat(order_amount) * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount && discount > parseFloat(coupon.max_discount_amount)) {
        discount = parseFloat(coupon.max_discount_amount);
      }
    } else {
      discount = parseFloat(coupon.discount_value);
    }

    res.json({
      valid: true,
      coupon_id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value),
      discount_amount: discount,
      applicable_to: coupon.applicable_to,
    });
  } catch (err) {
    console.error('POST /coupons/validate error:', err);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// GET /api/payments/history - Get user's payment history (auth)
router.get('/payments/history', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, s.billing_cycle, pl.display_name AS plan_name
       FROM payments p
       LEFT JOIN subscriptions s ON s.id = p.subscription_id
       LEFT JOIN plans pl ON pl.id = s.plan_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('GET /payments/history error:', err);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// GET /api/revenue/summary - Admin revenue KPIs (auth + requireRole)
router.get('/revenue/summary', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const [totalRevenue, activeSubscriptions, mrr, recentPayments] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(amount), 0)::numeric AS total_revenue FROM payments WHERE status = 'completed'`),
      pool.query(`SELECT COUNT(*)::int AS active_count FROM subscriptions WHERE status = 'active'`),
      pool.query(
        `SELECT COALESCE(SUM(CASE WHEN billing_cycle = 'monthly' THEN pl.monthly_price ELSE pl.yearly_price / 12 END), 0)::numeric AS mrr
         FROM subscriptions s
         JOIN plans pl ON pl.id = s.plan_id
         WHERE s.status = 'active'`
      ),
      pool.query(
        `SELECT p.*, u.name AS user_name, u.email AS user_email, pl.display_name AS plan_name
         FROM payments p
         JOIN users u ON u.id = p.user_id
         LEFT JOIN subscriptions s ON s.id = p.subscription_id
         LEFT JOIN plans pl ON pl.id = s.plan_id
         ORDER BY p.created_at DESC
         LIMIT 10`
      ),
    ]);

    res.json({
      total_revenue: parseFloat(totalRevenue.rows[0].total_revenue),
      active_subscriptions: activeSubscriptions.rows[0].active_count,
      mrr: parseFloat(mrr.rows[0].mrr),
      recent_payments: recentPayments.rows,
    });
  } catch (err) {
    console.error('GET /revenue/summary error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue summary' });
  }
});

module.exports = router;
