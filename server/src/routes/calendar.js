const express = require('express');
const rateLimit = require('express-rate-limit');
const { bookCalendarSlot } = require('../services/calendar');

const router = express.Router();

// Rate limit: 10 bookings per hour per IP
const calLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many booking attempts. Please try again later.' },
});

// ── POST /api/book-calendar ───────────────────────────────────────────────────
router.post('/book-calendar', calLimiter, async (req, res) => {
  try {
    const { slot, email } = req.body || {};

    if (!slot || typeof slot !== 'string') {
      return res.status(400).json({ success: false, error: 'slot is required' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'valid email is required' });
    }

    const result = await bookCalendarSlot(slot, email.toLowerCase().trim());

    if (!result.success) {
      // Log but still return success-like to user — don't block on calendar failures
      console.warn('[Calendar] Booking failed (non-blocking):', result.error);
    }

    return res.status(200).json({
      success: true,
      message: 'Booking received.',
      eventId: result.eventId ?? null,
    });

  } catch (err) {
    console.error('[Calendar] Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Booking failed. Please try again.' });
  }
});

module.exports = router;
