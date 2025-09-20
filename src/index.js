import { DomRenderer } from "@ragyjs/dom-renderer";
import { Builder } from "./internal/builder.js";
import { Events } from "./internal/events.js";
import { Controller } from "./internal/controller.js";
import { randomName, formatDate, getPresetRanges, isSameDate, today, parseStartOfWeek } from "./utils/helpers.js";
import { locales } from "./utils/locales.js";

export class DatePicker {

    constructor(element, options) {
        this.el = element;
        this.o = options;

        this.r = new DomRenderer();
        this.e = new Events(this);
        this.b = new Builder(this);
        this.c = new Controller(this);
        
        this.picker = null;

        if (this.o.value) this._value = this.o.value;
        else if (this.o.mode === 'range') this._value = [today(), today()];
        else this._value = [today(), null];

        this.displayDate = null;

        this.locale = locales(this.o.locale ?? 'en');

        if ('trans' in this.o && typeof(this.o.trans) === 'object') {
            Object.entries(this.o.trans).forEach(([key, val]) => {
                this.locale[key] = val;
            });
        }

        this.pickerId = randomName();

        this.startOfWeek = parseStartOfWeek(this.o.startOfWeek ?? 0);
        
        this.render();
    }


    render() {

        if (!this.picker) this.picker = this.r.render(this.b.build());

        if (!this.days) this.days = this.picker.querySelectorAll('.rjs-body > .rjs-days > .rjs-day');

        this.set(this._value);

        this.el.append(this.picker);

    }

    destroy() {
        this.r.abort();
        this.picker.remove();

        this.displayDate = null;
        this.e.draggingDay = null;
        this.c.isAnimating = false;
        
        this.picker = null;
        this.days = null;
    }

    ///
    get value() {
       if (this.o.mode === 'range') return this._value;
        else return this._value[0];
    }

    focus() {
        if (!this.picker) return;
        this.picker.focus();
        this.picker.classList.add('rjs-focus', 'rjs-focus-force');
        this.picker.setAttribute('aria-expanded', 'true');
        this.picker.querySelector('.rjs-wrapper').removeAttribute('inert');
        return this;
    }

    blur() {
        if (!this.picker) return;
        this.picker.blur();
        this.picker.classList.remove('rjs-focus', 'rjs-focus-force');
        this.picker.setAttribute('aria-expanded', 'false');
        this.picker.querySelector('.rjs-wrapper').setAttribute('inert', '');
        return this;
    }

    startLoading(){
        if (!this.picker) return;
        this.picker.classList.add('rjs-loading');
        this.blur();
        this.picker.blur();
        return this;
    }

    stopLoading(){
        if (!this.picker) return;
        if (!this.picker.classList.contains('rjs-loading')) {return this;}
        this.picker.classList.remove('rjs-loading');
        return this;
    }

    error(msg, focus = false) {
        if (!this.picker) return;

        focus ? this.focus() : null;

        this.picker.querySelector('.rjs-errorMsg').innerHTML = msg ?? '';
        this.picker.classList.add('rjs-error');

        return this;
    }

    clearError() {
        if (!this.picker) return this;
        this.picker.querySelector('.rjs-errorMsg').innerHTML = '';
        this.picker.classList.remove('rjs-error');
        return this;
    }
    //

    nextMonth(callback = () => {}) {
        if (!this.displayDate) this.displayDate = today();

        let { year, month } = this.displayDate;

        month++;
        if (month > 12) {
            month = 1;
            year++;
        }

        this.displayDate = { year, month, day: 1 };
        this.c.animate('next', () => {
            this.c.setDisplayDate(this.displayDate);
            if (typeof callback === 'function') callback();
        })

        return this;

    }

    prevMonth(callback = () => {}) {
        if (!this.displayDate) this.displayDate = today();

        let { year, month } = this.displayDate;

        month--;
        if (month < 1) {
            month = 12;
            year--;
        }

        this.displayDate = { year, month, day: 1 };
        this.c.animate('prev', () => {
            this.c.setDisplayDate(this.displayDate);
            if (typeof callback === 'function') callback();
        });

        return this;
    }

    set(value, silent = true) {
        if (!value) { this._value = [null, null]; this.c.setDisplayDate(); this.c.setDisplayValue('custom'); return this; }

        this._value = this.c.calcValue(value);

        let selectedPeriodName = null;

        if (this.o.mode === 'range') {
            const periods = getPresetRanges(this.startOfWeek);
            Object.entries(periods).forEach(([periodName, periodVal]) => {
                if (isSameDate(this._value[0], periodVal[0]) && isSameDate(this._value[1], periodVal[1]))  {
                    this.displayDate = this._value[0];
                    this.c.setSelectedPeriod(periodName)
                    selectedPeriodName = periodName;
                }
            })

            selectedPeriodName === null ? this.c.setSelectedPeriod('custom') : null;

            !silent ? this.o.onPick?.(this._value) : null;
        } else {
            !silent ? this.o.onPick?.(this._value[0]) : null;
        }

        if (this.picker) {
            const applyBtn = this.picker.querySelector('.rjs-applyBtn');
            if (this.o.mode === 'range' && (!this._value[0] || !this._value[1]) )  applyBtn.disabled = true;
            else if (this.o.mode === 'single' && !this._value[0]) applyBtn.disabled = true;
            else applyBtn.disabled = false;
        }

        this.c.setDisplayDate();

        this.c.setDisplayValue(selectedPeriodName);

        return this;
    }

    format(format) {
        if (this.o.mode === 'range') return [formatDate(this._value[0], format, this.locale), formatDate(this._value[1], format, this.locale)];
        else return formatDate(this._value[0], format, this.locale);
    }
    
    selectPeriod(period, silent = true) {

        if (period !== 'custom') {
            this.c.animate('fade', () => {
                const newValue = getPresetRanges(this.startOfWeek, period);
                this.set(newValue, silent);
            })
        }

        this.c.setSelectedPeriod(period);

        return this;
    }
}
