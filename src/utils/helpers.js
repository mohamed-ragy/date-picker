
export function filterPeriods(periods, maxRange = null) {
      if (!maxRange) return Object.keys(periods);

      const out = [];

      Object.entries(periods).forEach(([periodName, periodMaxRange]) => {
      if (maxRange >= periodMaxRange) out.push(periodName);
      })

      return out;

}

export function randomName(length = 10) {
      const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
      result += characters.charAt(
            Math.floor(Math.random() * characters.length)
      );
      }
      return `_${result}`;
}

export function today () {
    const today = new Date();
    return {
        day:today.getDate(),
        month:today.getMonth() + 1,
        year:today.getFullYear(),
    }
}

export function isValidDate(value) {
    if (!value) return false;
    const {year, month, day} = value;
    if (!year || !month || !day) return false;

    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
    );
}

export function isValidRange(start, end) {

    if (!isValidDate(start) || !isValidDate(end)) return false;

    const d1 = toTimestamp(start)
    const d2 = toTimestamp(end);

    return d1 <= d2;
}

export function toTimestamp({ year, month, day }) {
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day).getTime() / 1000;
}

export function getRangePosition(start, end, target) {
    if (!start || !target) return 'invalid';

    const tStart = toTimestamp(start);
    const tVal   = toTimestamp(target);

    if (!end) {
        if (tVal === tStart) return 'start';
        return tVal < tStart ? 'before-start' : 'after-end';
    }

    const tEnd = toTimestamp(end);

    if (tVal === tStart && tVal === tEnd) return 'start_and_end';
    if (tVal === tStart) return 'start';
    if (tVal === tEnd) return 'end';

    if (tVal > tStart && tVal < tEnd) {
        const distStart = tVal - tStart;
        const distEnd   = tEnd - tVal;
        return distStart <= distEnd ? 'in-range-near-start' : 'in-range-near-end';
    }

    if (tVal < tStart) return 'before-start';
    if (tVal > tEnd) return 'after-end';

    return 'invalid';
}

export function toDateObj(date) {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
    };
}

export function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

export function startOfWeek(date, _startOfWeek) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day - _startOfWeek + 7) % 7; 
    d.setDate(d.getDate() - diff);
    return d;
}

export function endOfWeek(date, _startOfWeek) {
    const start = startOfWeek(date, _startOfWeek);
    return addDays(start, 6);
}

export function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfYear(date) {
    return new Date(date.getFullYear(), 0, 1);
}

export function endOfYear(date) {
    return new Date(date.getFullYear(), 11, 31);
}

export function getPresetRanges(_startOfWeek, range = null) {
    const today = new Date();
    const yesterday = addDays(today, -1);
    const data = {
        today:      [toDateObj(today), toDateObj(today)],
        yesterday:  [toDateObj(yesterday), toDateObj(yesterday)],

        last7days:  [toDateObj(addDays(today, -6)), toDateObj(today)],
        last30days: [toDateObj(addDays(today, -29)), toDateObj(today)],
        last90days: [toDateObj(addDays(today, -89)), toDateObj(today)],

        thisWeek:   [toDateObj(startOfWeek(today, _startOfWeek)), toDateObj(endOfWeek(today, _startOfWeek))],
        thisMonth:  [toDateObj(startOfMonth(today)), toDateObj(endOfMonth(today))],
        thisYear:   [toDateObj(startOfYear(today)), toDateObj(endOfYear(today))],

        lastWeek:   (() => {
            const start = addDays(startOfWeek(today, _startOfWeek), -7);
            const end   = addDays(start, 6);
            return [toDateObj(start), toDateObj(end)];
        })(),

        lastMonth:  (() => {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const end   = new Date(today.getFullYear(), today.getMonth(), 0);
            return [toDateObj(start), toDateObj(end)];
        })(),

        lastYear:   (() => {
            const start = startOfYear(new Date(today.getFullYear() - 1, 0, 1));
            const end   = endOfYear(new Date(today.getFullYear() - 1, 11, 31));
            return [toDateObj(start), toDateObj(end)];
        })(),

        custom:     [null, null] 
    };

    if (range) return data[range];

    return data;
}

export function isSameDate(a, b) {
    return (
        a &&
        b &&
        a.day === b.day &&
        a.month === b.month &&
        a.year === b.year
    );
}

export function formatDate({ day, month, year }, format = 'dd-M-YY', locale) {
    if (!day || !month || !year || typeof format !== 'string') return '';

    const dayPadded = String(day).padStart(2, '0');
    const monthPadded = String(month).padStart(2, '0');

    const dateObj = new Date(year, month - 1, day);
    const weekdayIndex = dateObj.getDay();

    const tokens = {
        d: day,
        dd: dayPadded,
        D: locale.weekDaysShort?.[weekdayIndex] || '',
        DD: locale.weekDaysLong?.[weekdayIndex] || '',
        m: month,
        mm: monthPadded,
        M: locale.monthsShort?.[month - 1] || '',
        MM: locale.monthsLong?.[month - 1] || '',
        YY: String(year).slice(-2),
        YYYY: String(year),
    };

    const final = format.replace(/d{1,2}|m{1,2}|Y{2,4}|D{1,2}|M{1,2}/g, (match) => {
        return tokens[match] ?? match;
    });

    return final;
}

export const icons = {
    arrowLeft:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    arrowRight:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    arrowDown:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    calendar:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
    checkbox:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>',
    checkboxChecked:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"/><path d="m9 11 3 3L22 4"/></svg>',
}

export function rotateWeekDays(startIndex, weekdays) {
  const idx = startIndex % weekdays.length;
  return weekdays.slice(idx).concat(weekdays.slice(0, idx));
}

export function parseStartOfWeek(input) {
    if (typeof input === 'number' && input >= 0 && input <= 6) return input;
    if (typeof input === 'string') {
        const map = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };
        const normalized = input.trim().slice(0, 3).toLowerCase();
        return normalized in map ? map[normalized] : 0;
    }
    return 0;

}