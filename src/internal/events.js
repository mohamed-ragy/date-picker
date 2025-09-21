import { getRangePosition, toTimestamp } from "../utils/helpers.js";

export class Events {
    constructor(datePicker) {
        this.dp = datePicker;
        this.o = this.dp.o;
        this.draggingDay = null;
    }

    periodsClickHandler(event) {
        const periodEl = event.target.closest('.rjs-period');
        if (!periodEl) return;
        const period = periodEl.getAttribute('data-period');
        this.dp.selectPeriod(period, false);
    }

    periodsKeydownHandler(event) {
        const key = event.key.toLowerCase();
        const periodsEl = event.target.closest('.rjs-periods');
        let selectedPeriod = periodsEl.querySelector('.rjs-period.rjs-focus');
        if (!selectedPeriod) selectedPeriod = periodsEl.querySelector('.rjs-period:first-child');

        if (key === ' ' || key === 'enter' || key === 'arrowup' || key === 'arrowdown') event.preventDefault();
        
        if (key === 'arrowdown') {
            if (selectedPeriod.nextElementSibling) selectedPeriod.nextElementSibling.classList.add('rjs-focus');
            else periodsEl.querySelector('.rjs-period:first-child').classList.add('rjs-focus');
            selectedPeriod.classList.remove('rjs-focus');
        } else if (key === 'arrowup') {
            if (selectedPeriod.previousElementSibling) selectedPeriod.previousElementSibling.classList.add('rjs-focus');
            else periodsEl.querySelector('.rjs-period:last-child').classList.add('rjs-focus');
            selectedPeriod.classList.remove('rjs-focus');

        } else if (key === ' ' || key === 'enter') {
            const period = selectedPeriod.getAttribute('data-period');
            this.dp.selectPeriod(period, false);
        }
    }

    periodsFocusHandler(event) {
        const target = event.currentTarget;
        (target.querySelector('.rjs-period.rjs-selected') ?? target.querySelector('.rjs-period:first-child'))?.classList?.add('rjs-focus');
    }
    
    periodsBlurHandler(event) {
        const target = event.target.querySelector('.rjs-period.rjs-focus');
        target ? target.classList.remove('rjs-focus') : null;
    }

    daysGridKeydownHandler(event) {
        const key = event.key.toLowerCase();

        let highlightedDay = this.dp.picker.querySelector('.rjs-day.rjs-highlight');
        if (!highlightedDay) {
            const first = this.dp.picker.querySelector('.rjs-day:first-child');
            if (first) {
                first.classList.add('rjs-highlight');
                highlightedDay = first;
            }
        }

        if (!highlightedDay) return;

        if (key === 'arrowright') {
            event.preventDefault();
            highlightedDay.classList.remove('rjs-highlight');

            if(highlightedDay.nextElementSibling) {
                highlightedDay.nextElementSibling.classList.add('rjs-highlight');
                this.dp.c.highlightPick(highlightedDay.nextElementSibling);
            }
            else {
                this.dp.nextMonth(() => {
                    const firstDay = this.dp.picker.querySelector('.rjs-day:first-child');
                    if (firstDay) {
                        firstDay.classList.add('rjs-highlight');
                        this.dp.c.highlightPick(firstDay);
                    }
                });
            }

        } else if (key === 'arrowleft') {
            event.preventDefault();
            highlightedDay.classList.remove('rjs-highlight');

            if(highlightedDay.previousElementSibling) {
                highlightedDay.previousElementSibling.classList.add('rjs-highlight')
                this.dp.c.highlightPick(highlightedDay.previousElementSibling);
            } else {
                this.dp.prevMonth(() => {
                    const lastDay = this.dp.picker.querySelector('.rjs-day:last-child');
                    lastDay.classList.add('rjs-highlight')
                    this.dp.c.highlightPick(lastDay);
                });
            }


        } else if (key === 'arrowup') {
            event.preventDefault();
            let currentDay = highlightedDay;
            for (let idx = 0; idx < 7; idx++) {
                if (currentDay) currentDay = currentDay.previousElementSibling;
                else {
                    currentDay = null;
                    break;
                }
            }
            if (currentDay) {
                highlightedDay.classList.remove('rjs-highlight');
                currentDay.classList.add('rjs-highlight');
                this.dp.c.highlightPick(currentDay);
            }

        } else if (key === 'arrowdown') {
            event.preventDefault();
            let currentDay = highlightedDay;
            for (let idx = 0; idx < 7; idx++) {
                if (currentDay) currentDay = currentDay.nextElementSibling;
                else {
                    currentDay = null;
                    break;
                }
            }
            if (currentDay) {
                highlightedDay.classList.remove('rjs-highlight');
                currentDay.classList.add('rjs-highlight');
                this.dp.c.highlightPick(currentDay);

            }
        } else if (key === ' ' || key === 'enter') {
            event.preventDefault();
            this.dp.c.pick(highlightedDay);
        }   
        else if (key === 'escape') { event.preventDefault(); this.dp.blur(); return; }

    }

    daysPointerdownHandler(event) {
        
        if (this.o.mode !== 'range') return;

        const dayEl = event.target.closest('.rjs-day');
        if (!dayEl) return;

        const dayValue = {
            day:parseInt(dayEl.getAttribute('data-day')),
            month:parseInt(dayEl.getAttribute('data-month')),
            year:parseInt(dayEl.getAttribute('data-year')),
        }

        const position = getRangePosition(...this.dp._value, dayValue);

        if (position === 'start' || position === 'before-start' || position === 'in-range-near-start') this.draggingDay = 'start';
        else if (position === 'end' || position === 'after-end' || position === 'in-range-near-end') this.draggingDay = 'end';
        else if (position === 'start_and_end') this.draggingDay = 'end';
        else this.draggingDay = 'start';
    }

    daysPointerupHandler(event) {
        if (this.o.mode !== 'range') return;

        this.draggingDay = null;
    }

    daysPointercancelHandler(event) {
        if (this.o.mode !== 'range') return;
        
        this.draggingDay = null;
        this.dp.c.setDisplayDate();
    }

    daysPointerleaveHandler(event) {
        if (this.o.mode !== 'range') return;

        this.draggingDay = null;
        this.dp.c.setDisplayDate();
    }

    daysPointermoveHandler(event) {
        if (this.o.mode !== 'range') return;
        if (!this.draggingDay) return;

        const targetDay = document.elementFromPoint(event.clientX, event.clientY)?.closest('.rjs-day');

        if (!targetDay || !targetDay.classList.contains('rjs-day')) return;

        const targetValue = {
            year:parseInt(targetDay.getAttribute('data-year')),
            month:parseInt(targetDay.getAttribute('data-month')),
            day:parseInt(targetDay.getAttribute('data-day')),
        };

        if (this.draggingDay === 'start') {

            const d1 = toTimestamp(targetValue);
            let d2;
            if (this.dp._value[1]) d2 = toTimestamp(this.dp._value[1]);
            else {
                d2 = toTimestamp(targetValue);
                this.draggingDay = 'end';
            }

            if (d1 <= d2) this.dp.set([targetValue, this.dp._value[1]]);

            else if (d1 > d2) {
                this.dp.set([this.dp._value[1], targetValue]);
                this.draggingDay = 'end';
            }

        }

        else if (this.draggingDay === 'end') {

            const d1 = toTimestamp(this.dp._value[0]);
            const d2 = toTimestamp(targetValue);

            if (d1 <= d2) this.dp.set([this.dp._value[0], targetValue]);

            else if (d1 > d2) {
                this.dp.set([targetValue, this.dp._value[0]]);
                this.draggingDay = 'start';
            }

        }
    }

    daysMousemoveHandler(event) {
        if (this.o.mode !== 'range') return;
        const targetDayEl = event.target.closest('.rjs-day');
        if (!targetDayEl) return;
        this.dp.c.highlightPick(targetDayEl);
    }

    daysClickHandler(event) {
        const dayEl = event.target.closest('.rjs-day');
        if (!dayEl || dayEl.classList.contains('rjs-disabled')) return;
        this.dp.c.pick(dayEl);
        this.dp.picker.querySelector('.rjs-day.rjs-highlight')?.classList?.remove?.('rjs-highlight');
    }

    headDisplayDateMonthClickHandler(event) {
        const dropDown = event.target.closest('.rjs-displayMonth').querySelector('.rjs-dropDown');
        if (!dropDown) return;

        if (document.activeElement !== dropDown) {
            requestAnimationFrame(() => {
                const maxDate = this.o.maxDate ?? null;
                const minDate = this.o.minDate ?? null;

                dropDown.querySelectorAll('.rjs-dropDownItem').forEach(item => {
                    item.classList.remove('rjs-selected');
                    item.style.display = '';
                    const targetTimestamp = toTimestamp({year:this.dp.displayDate.year, month:parseInt(item.getAttribute('data-month'), 10), day:1});
                                                
                    if (maxDate) {
                        const maxTimestamp = toTimestamp({year:maxDate.year, month:maxDate.month, day:1});
                        if (targetTimestamp > maxTimestamp) item.style.display = 'none';
                    }

                    if (minDate) {
                        const minTimestamp = toTimestamp({year:minDate.year, month:minDate.month, day:1});
                        if (targetTimestamp < minTimestamp) item.style.display = 'none';
                    }
                    
                });

                dropDown.focus();

                const target = dropDown.querySelector(`[data-month="${this.dp.displayDate.month}"]`);
                if (target) {
                    target.classList.add('rjs-selected')
                    dropDown.scrollTop = target.offsetTop - dropDown.offsetTop;
                }
            });

            return;
        }

        const item = event.target.closest('.rjs-dropDownItem');
        if (!item) return;

        const month = parseInt(item.getAttribute('data-month'), 10);
        if (!month) return;

        this.dp.picker.querySelector('.rjs-displayYear .rjs-dropDown').focus();
        this.dp.c.animate('fade', () => {
            this.dp.c.setDisplayDate({month, year:this.dp.displayDate.year});
        })
    }

    headDisplayDateYearClickHandler(event) {
        const dropDown = event.target.closest('.rjs-displayYear').querySelector('.rjs-dropDown');
        if (!dropDown) return;

        if (document.activeElement !== dropDown) {
            requestAnimationFrame(() => {
                const items = dropDown.querySelectorAll('.rjs-dropDownItem').forEach(item => item.classList.remove('rjs-selected'))
                dropDown.focus();
                const target = dropDown.querySelector(`[data-year="${this.dp.displayDate.year}"]`);
                if (target) {
                    target.classList.add('rjs-selected')
                    dropDown.scrollTop = target.offsetTop - dropDown.offsetTop;
                }                
            });
            return;
        }

        const item = event.target.closest('.rjs-dropDownItem');
        if (!item) return;

        const year = parseInt(item.getAttribute('data-year'), 10);
        if (!year) return;

        const maxDate = this.o.maxDate ?? null;
        const minDate = this.o.minDate ?? null;
        let month = this.dp.displayDate.month;
        const targetTimestamp = toTimestamp({year, month, day:1});

        if (minDate) {
            const minTimestamp = toTimestamp({year:minDate.year, month:minDate.month, day:1});
            if (targetTimestamp < minTimestamp) month = minDate.month;
        }

        if (maxDate) {
            const maxTimestamp = toTimestamp({year:maxDate.year, month:maxDate.month, day:1});
            if (targetTimestamp > maxTimestamp) month = maxDate.month;
        }

        this.dp.picker.querySelector('.rjs-arrowRight').focus();
        this.dp.c.animate('fade', () => {
            this.dp.c.setDisplayDate({month:month, year});
        })
    }

    headDisplayDateDropDownKeyDownHandler(event) {
        const key = event.key.toLowerCase();
        const dropDown = event.target.closest('.rjs-dropDown');

        if (key !== 'arrowup' && key !== 'arrowdown' && key !== 'enter' && key !== ' ') {
            return;
        }

        event.preventDefault();

        let selected = dropDown.querySelector('.rjs-dropDownItem.rjs-selected');
        let highlighted = dropDown.querySelector('.rjs-dropDownItem.rjs-highlighted');

        if (selected && !highlighted) highlighted = selected;

        let target;

        if (key === 'enter' || key === ' ' && highlighted) {
            
            let month = highlighted.getAttribute('data-month');
            let year = highlighted.getAttribute('data-year');

            if (!year) {
                year = this.dp.displayDate.year;
                this.dp.picker.querySelector('.rjs-displayYear .rjs-dropDown').focus();

            }
            if (!month) {
                month = this.dp.displayDate.month;
                this.dp.picker.querySelector('.rjs-arrowRight').focus();
            }

            
            dropDown.querySelectorAll('.rjs-dropDownItem').forEach(item => item.classList.remove('rjs-highlighted', 'rjs-selected'))
            highlighted.classList.add('rjs-selected');
            dropDown.scrollTop = highlighted.offsetTop - dropDown.offsetTop;

            this.dp.c.animate('fade', () => {
                this.dp.c.setDisplayDate({month, year});
            });
            
            return
        }

        if (key === 'arrowup') {
            if (!highlighted) target = dropDown.querySelector('.rjs-dropDownItem:nth-child(1)')
            else if (highlighted.previousElementSibling) target = highlighted.previousElementSibling; 
            else target = dropDown.querySelector('.rjs-dropDownItem:last-child');
        
        } else if (key === 'arrowdown') {
            if (!highlighted) target = dropDown.querySelector('.rjs-dropDownItem:last-child')
            else if (highlighted.nextElementSibling) target = highlighted.nextElementSibling; 
            else target = dropDown.querySelector('.rjs-dropDownItem:nth-child(1)');

        }

        dropDown.querySelectorAll('.rjs-dropDownItem').forEach(item => item.classList.remove('rjs-highlighted'))
        target.classList.add('rjs-highlighted');
        dropDown.scrollTop = target.offsetTop - dropDown.offsetTop;



    }
}
