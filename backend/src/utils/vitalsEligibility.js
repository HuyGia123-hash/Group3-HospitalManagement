
export function parseSlotStartEnd(dateStr, timeSlot) {
    const m = String(timeSlot || '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!m) return null;
    const [, h1, min1, h2, min2] = m;
    const parts = String(dateStr || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
    const [y, mo, da] = parts;
    const start = new Date(y, mo - 1, da, Number(h1), Number(min1), 0, 0);
    const end = new Date(y, mo - 1, da, Number(h2), Number(min2), 0, 0);
    return { start, end };
}

const TERMINAL = ['cancelled', 'Completed', 'Completed', 'completed', 'Cancelled'];


export function canNurseRecordVitals(apt, now = new Date()) {
    if (!apt) {
        return { ok: false, code: 'MISSING', message: 'No appointment found' };
    }
    const status = (apt.status || '').toLowerCase();
    if (['cancelled', 'completed'].includes(status)) {
        return { ok: false, code: 'TERMINAL', message: 'Appointment has ended or been cancelled' };
    }

    const source = apt.appointmentSource || 'patient';
    const nowMs = now.getTime();

    if (source === 'walk_in') {
        let created = apt.nurseWalkInCreatedAt;
        if (created == null && apt.createdAt != null) {
            created = apt.createdAt < 1e12 ? apt.createdAt * 1000 : apt.createdAt;
        }
        if (created == null) created = nowMs;
        const WALK_IN_WINDOW_MS = 24 * 3600 * 1000;
        if (nowMs - created <= WALK_IN_WINDOW_MS) {
            return { ok: true, code: 'WALK_IN', message: 'Walk-in appointment — vitals can be recorded immediately after creation' };
        }
        return {
            ok: false,
            code: 'WALK_IN_EXPIRED',
            message: 'Vitals recording window for walk-in has expired (24h after creation)',
        };
    }

    const parsed = parseSlotStartEnd(apt.date, apt.timeSlot);
    if (!parsed) {
        return { ok: false, code: 'BAD_SLOT', message: 'Could not parse appointment time slot' };
    }
    if (nowMs < parsed.start.getTime()) {
        return {
            ok: false,
            code: 'TOO_EARLY',
            message: `Vitals can only be recorded after the start of the time slot (${apt.timeSlot})`,
        };
    }
    return { ok: true, code: 'SLOT_OK', message: 'Recording vitals allowed' };
}
