import { formatDate, getRangePosition, icons, isValidDate, isValidRange, today, toTimestamp } from "../utils/helpers.js";

export class Controller {

    constructor(datePicker) {
        this.dp = datePicker;
        this.o = this.dp.o;
        this.isAnimating = false;
    }

    setDisplayDate(date = null) {
        if (!this.dp.picker) return;

        if (!date) date = this.dp.displayDate ??= this.dp._value[0] ?? today();

        this.dp.picker.querySelector(".rjs-head > .rjs-label").textContent = `${this.dp.locale.monthsLong[date.month - 1]} ${date.year}`;

        const rawFirstDay = new Date(date.year, date.month - 1, 1).getDay(); 
        const firstDay = (rawFirstDay - this.dp.startOfWeek + 7) % 7;

        const daysInMonth = new Date(date.year, date.month, 0).getDate();
        const prevMonthDays = new Date(date.year, date.month - 1, 0).getDate();

        const days = this.dp.days;

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = prevMonthDays - (firstDay - 1 - i);
            const month = date.month === 1 ? 12 : date.month - 1;
            const year = date.month === 1 ? date.year - 1 : date.year;
            days[i].textContent = day;
            days[i].classList.add("rjs-otherMonth");
            days[i].setAttribute("data-year", year);
            days[i].setAttribute("data-month", month);
            days[i].setAttribute("data-day", days[i].textContent);
            this.setDayDisplayState(days[i], this.dp._value[0], this.dp._value[1]);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const index = firstDay + day - 1;
            days[index].textContent = day;
            days[index].classList.remove("rjs-otherMonth");
            days[index].setAttribute("data-year", date.year);
            days[index].setAttribute("data-month", date.month);
            days[index].setAttribute("data-day", day);
            this.setDayDisplayState(
                days[index],
                this.dp._value[0],
                this.dp._value[1]
            );
        }

        let nextDay = 1;
        for (let i = firstDay + daysInMonth; i < days.length; i++) {
            const day = nextDay++;
            const month = date.month === 12 ? 1 : date.month + 1;
            const year = date.month === 12 ? date.year + 1 : date.year;
            days[i].textContent = day;
            days[i].classList.add("rjs-otherMonth");
            days[i].setAttribute("data-year", year);
            days[i].setAttribute("data-month", month);
            days[i].setAttribute("data-day", days[i].textContent);
            this.setDayDisplayState(days[i], this.dp._value[0], this.dp._value[1]);
        }
    }

    setDisplayValue(periodName = null) {
        if (!this.dp.picker) return;
        
        const valueEl = this.dp.picker.querySelector(".rjs-selector > .rjs-value");

        const placeholder = `<span class="rjs-placeholder">${
            this.o.placeholder ?? ""
        }</span>`;

        if (!this.dp._value[0] && !this.dp._value[1]) {
            valueEl.innerHTML = placeholder;
            return;
        }

        const date1 = this.dp._value[0]
            ? formatDate(this.dp._value[0], this.o.format, this.dp.locale)
            : placeholder;

        if (this.o.mode === "range") {
            if (periodName && this.dp._value[0] && this.dp._value[1]) {
                valueEl.innerHTML = this.dp.locale[periodName] ?? `${formatDate(this.dp._value[0], this.o.format, this.dp.locale)} - ${formatDate(this.dp._value[1], this.o.format, this.dp.locale)}`;
            } else {
                const date2 = this.dp._value[1]
                    ? formatDate(this.dp._value[1], this.o.format, this.dp.locale)
                    : placeholder;
                valueEl.innerHTML = `${date1} - ${date2}`;
            }
        } else {
            valueEl.innerHTML = date1;
        }
    }

    calcValue(value) {
        const inArr = Array.isArray(value) ? value : [value, null];
        const val = [
            inArr[0] ? { ...inArr[0] } : null,
            inArr[1] ? { ...inArr[1] } : null,
        ];

        const clamp = (dv) => {
            if (!isValidDate(dv)) return dv;
            if (this.o.minDate && toTimestamp(dv) < toTimestamp(this.o.minDate)) return { ...this.o.minDate };
            if (this.o.maxDate && toTimestamp(dv) > toTimestamp(this.o.maxDate)) return { ...this.o.maxDate };
            return dv;
        };

        val[0] = clamp(val[0]);
        val[1] = clamp(val[1]);


        if (this.o.mode === 'range') {

            if (!Array.isArray(value) || value.length !== 2) return [null, null];

            else if (isValidDate(val[0]) && !isValidDate(val[1])) return [val[0], null];

            else if (isValidRange(val[0], val[1])) {

                let start = val[0], end = val[1];

                if (toTimestamp(start) > toTimestamp(end)) [start, end] = [end, start];

                const d1 = toTimestamp(start) * 1000;
                const d2 = toTimestamp(end) * 1000;

                if (this.o.maxRange) {

                    const maxMs = (this.o.maxRange - 1) * 24 * 60 * 60 * 1000;

                    if ((d2 - d1) > maxMs) {
                        const newEndDate = new Date(d1 + maxMs);
                        end = {
                            day:newEndDate.getDate(),
                            month:newEndDate.getMonth() + 1,
                            year:newEndDate.getFullYear(),
                        };
                    }
                }

                return [start, end];

            }

            return [null, null];

        } else {

            if (isValidDate(val[0])) return [val[0], null];

            else return [null, null];
        }
    }

    setSelectedPeriod(period) {
        if (!this.dp.picker) return;

        const periods = this.dp.picker.querySelectorAll('.rjs-periods .rjs-period');

        periods.forEach(periodEl => {
            if (periodEl.getAttribute('data-period') === period) {
                periodEl.querySelector('.rjs-icon').innerHTML = icons.checkboxChecked;
                periodEl.classList.add('rjs-selected')
            } else {
                periodEl.querySelector('.rjs-icon').innerHTML = icons.checkbox;
                periodEl.classList.remove('rjs-selected')
            }
        })
    }

    setDayDisplayState(dayEl, date1, date2) {

        dayEl.classList.remove('rjs-selected', 'rjs-rangeStart', 'rjs-rangeEnd', 'rjs-inRange', 'rjs-inHover');
        
        const year = parseInt(dayEl.getAttribute('data-year'));
        const month = parseInt(dayEl.getAttribute('data-month'));
        const day = parseInt(dayEl.getAttribute('data-day'));

        if (!this.dp._value) return;

        if (this.o.mode === 'single') {
            const selected = date1;
            if (
                selected &&
                selected.year === year &&
                selected.month === month &&
                selected.day === day
            ) {
                dayEl.classList.add('rjs-selected');
                dayEl.setAttribute('aria-selected', 'true')
            } else {
                dayEl.setAttribute('aria-selected', 'false')
            }
        }

        if (this.o.mode === 'range') {

            const position = getRangePosition(date1, date2, {year, month, day});

            if (position === 'start') {dayEl.classList.add('rjs-rangeStart'); dayEl.setAttribute('aria-selected', 'true');}
            else if (position === 'end') {dayEl.classList.add('rjs-rangeEnd'); dayEl.setAttribute('aria-selected', 'true');}
            else if (position === 'start_and_end') {dayEl.classList.add('rjs-rangeStart', 'rjs-rangeEnd'); dayEl.setAttribute('aria-selected', 'true');}
            else if (
                position === 'in-range-near-start' ||
                position === 'in-range-near-end'
            ) {dayEl.classList.add('rjs-inRange'); dayEl.setAttribute('aria-selected', 'true');}
            else dayEl.setAttribute('aria-selected', 'false');

        } else {

        }
    }

    animate(direction, callback = () => {}) {
        if (this.isAnimating) return;
        if (!this.dp.picker) return;
        if (!['next', 'prev', 'fade'].includes(direction)) return;

        const body = this.dp.picker.querySelector('.rjs-body');
        body.classList.remove('rjs-toRight', 'rjs-toLeft', 'rjs-animating');
        let transitionTimout;
        let onEnd = () => {};
        this.isAnimating = true;
        if (direction === 'prev') {
            body.classList.add('rjs-toRight');

            onEnd = (event) => {
                if (event.target !== body) return;
                clearTimeout(transitionTimout);
                callback();
                body.classList.remove('rjs-toRight');
                body.classList.add('rjs-preventAnimation', 'rjs-toLeft');

                setTimeout(() => {
                    body.classList.remove('rjs-preventAnimation', 'rjs-toLeft');
                },0)

                body.removeEventListener('transitionend', onEnd);
                this.isAnimating = false;
            }

        } else if (direction === 'next') {
            body.classList.add('rjs-toLeft');

            onEnd = (event) => {
                if (event.target !== body) return;
                clearTimeout(transitionTimout);
                callback();

                body.classList.remove('rjs-toLeft');
                body.classList.add('rjs-preventAnimation', 'rjs-toRight');

                setTimeout(() => {
                    body.classList.remove('rjs-preventAnimation', 'rjs-toRight');
                },0)

                body.removeEventListener('transitionend', onEnd);
                this.isAnimating = false;
            }
        } else if (direction === 'fade') {
            body.classList.add('rjs-fadeout');

            onEnd = (event) => {
                if (event.target !== body) return;

                clearTimeout(transitionTimout);
                callback();

                body.classList.remove('rjs-fadeout');
                body.removeEventListener('transitionend', onEnd);
                this.isAnimating = false;
            }
        }

        body.addEventListener('transitionend', onEnd);

        transitionTimout = setTimeout(() => {
            callback();
            body.classList.remove('rjs-toRight', 'rjs-toLeft', 'rjs-fadeout', 'rjs-preventAnimation');
            body.removeEventListener('transitionend', onEnd);
            this.isAnimating = false;
        }, 150)
    }

    highlightPick(targetDayEl) {
        if (this.o.mode !== 'range') return;

        if (this.dp._value[0] && !this.dp._value[1]) {


            const hoverEndDate = {
                day:parseInt(targetDayEl.getAttribute('data-day')),
                month:parseInt(targetDayEl.getAttribute('data-month')),
                year:parseInt(targetDayEl.getAttribute('data-year')),
            };

            const d1 = toTimestamp(this.dp._value[0]);
            const d2 = toTimestamp(hoverEndDate);

            if (d1 <= d2) {
                this.dp.days.forEach(dayEl => {
                    this.setDayDisplayState(dayEl, this.dp._value[0], hoverEndDate);
                    if (dayEl.classList.contains('rjs-inRange') || dayEl.classList.contains('rjs-rangeEnd')) dayEl.classList.add('rjs-inHover')
                })
            } else {
                this.dp.days.forEach(dayEl => {
                    this.setDayDisplayState(dayEl, hoverEndDate, this.dp._value[0]);
                if (dayEl.classList.contains('rjs-inRange') || dayEl.classList.contains('rjs-rangeStart')) dayEl.classList.add('rjs-inHover')
                })
            }


        } else {
            this.setDisplayDate();
        }
    }

    pick(dayEl) {
        if (!this.dp.picker) return;

        const day = parseInt(dayEl.getAttribute('data-day'));
        const month = parseInt(dayEl.getAttribute('data-month'));
        const year = parseInt(dayEl.getAttribute('data-year'));

        const newValue = {day, month, year};

        if (this.o.mode === 'range') {

            if (!this.dp._value[0]) this.dp.set([newValue, null], true);

            else if (!this.dp._value[1]) {
                const d1 = toTimestamp(this.dp._value[0]);
                const d2 = toTimestamp(newValue);

                if (d1 <= d2) this.dp.set([this.dp._value[0], newValue], false);
                else if (d1 > d2) this.dp.set([newValue, this.dp._value[0]], false)
            }

            else {
                const position = getRangePosition(this.dp._value[0], this.dp._value[1], newValue);

                if (position === 'start_and_end') this.dp.set([null, null], true);

                else if (position === 'start') this.dp.set([this.dp._value[1], null], true);

                else if (position === 'end') this.dp.set([this.dp._value[0], null], true);

                else if (position === 'before-start') this.dp.set([newValue, this.dp._value[1]], false);

                else if (position === 'after-end') this.dp.set([this.dp._value[0], newValue], false);

                else if (position === 'in-range-near-start') this.dp.set([newValue, this.dp._value[1]], false);

                else if (position === 'in-range-near-end') this.dp.set([this.dp._value[0], newValue], false);

                else this.dp.set([null, null], true);
            }

        } else {

            this.dp.set([newValue, null], false);

        }
    }
    
    clear() {
        this.dp.c.animate('fade', () => {
            this.dp.displayDate = today();
            this.dp.set([null, null], true);
        })
        this.o.onClear?.();

    }

    apply() {
        this.dp.blur();
        this.o.onApply?.(this.dp.value);
    }
}
