import { icons, filterPeriods, rotateWeekDays } from "../utils/helpers.js";

export class Builder {
    constructor(datePicker) {
        
        this.dp = datePicker;

        this.o = this.dp.o;

        this.periods = {
            'today': 1, 'yesterday': 1,
            'last7days': 7, 'last30days': 30, 'last90days': 90,
            'thisWeek': 7, 'thisMonth': 31, 'thisYear': 366,
            'lastWeek': 7, 'lastMonth': 31, 'lastYear': 366, 'custom': 0,
        };


    }

    build() {
        
        return {
            class: `rjs-datePicker rjs-${this.o.theme ?? "cerulean"}`,
            attr: {
                "data-mode": this.o.mode === "range" ? "range" : "single",
                tabindex: "0",
                role: "button",
                "aria-haspopup": "dialog",
                "aria-expanded": "false",
                "aria-controls": this.dp.pickerId,
                "aria-label": this.o.label ?? "Date picker",
            },
            style:{
                ...this.o.style ?? {},
            },
            on: {
                focusin: (event) => {
                    this.dp.picker.classList.add('rjs-focus');
                    this.dp.picker.setAttribute('aria-expanded', 'true');
                    this.dp.picker.querySelector('.rjs-wrapper').removeAttribute('inert');
                },
                focusout: (event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        this.dp.picker.classList.remove('rjs-focus');
                        this.dp.picker.setAttribute('aria-expanded', 'false');
                        this.dp.picker.querySelector('.rjs-wrapper').setAttribute('inert', '');
                    }
                }
            },
            children: [
                
                this.o.label
                    ? { tag: "label", class: "rjs-label", text: this.o.label }
                    : null,

                {
                    class: "rjs-wrapper",
                    children: [

                        this.buildSelector(),

                        {
                            class:'rjs-pickerWrapper', children:[
                                
                                this.o.mode === 'range' ? this.buildPeriods() : null,
                                
                                this.buildPicker(),
                                
                            ]
                        },
                    ],
                },

                {class:'rjs-errorMsg', attr:{ 'aria-live':'polite' }}

            ],
        };
    }

    buildSelector() {
        return {
            class: "rjs-selector",
            children: [
                {
                    class: "rjs-icon",
                    html:icons.calendar,
                },
                { class: "rjs-value" },
                {
                    class: "rjs-icon2",
                    html: icons.arrowDown,
                },
            ],
        };
    }

    buildPeriods() {
        return {
            class:'rjs-periods',
            attr:{tabindex:'0'},
            children:filterPeriods(this.periods, this.o.maxRange).map(period => {
                return {
                    class:'rjs-period',
                    attr:{tabindex:'-1', 'data-period':period},
                    children:[
                        {class:'rjs-icon', html:icons.checkbox},
                        {text:this.dp.locale[period]},
                    ]
                }
            }),
            on:{
                click:this.dp.e.periodsClickHandler.bind(this.dp.e),
                keydown:this.dp.e.preiodsKeydownHandler.bind(this.dp.e),
                focus:this.dp.e.periodsFocusHandler.bind(this.dp.e),
                blur:this.dp.e.periodsBlurHandler.bind(this.dp.e),
            }
        }
    }

    buildPicker() {
        return {
                class:'rjs-picker',
                attr:{
                    role:'dialog',
                    id:this.dp.pickerId,
                    'aria-modal':'false',
                },
                children:[

                    {class:'rjs-head', children:[
                        {
                            tag:'button',
                            attr:{'aria-label':'Previous month'},
                            class:'rjs-arrowLeft',
                            html:icons.arrowRight,
                            on:{click:this.dp.prevMonth.bind(this.dp)}
                        },
                        {class:'rjs-label', attr:{'aria-live':'polite'}},
                        {
                            tag:'button',
                            attr:{'aria-label':'Next month'},
                            class:'rjs-arrowRight',
                            html:icons.arrowLeft,
                            on:{click:this.dp.nextMonth.bind(this.dp)}
                        }
                    ]},

                    {class:'rjs-body', children:[
                        {class:'rjs-weekDays', children:rotateWeekDays(this.dp.startOfWeek, this.dp.locale.weekdays).map(item => {return {class:'rjs-week', text:item}})},
                        
                        {
                            class:'rjs-days',
                            attr:{role:'grid', 'aria-readonly':'true', tabindex:'0', 'aria-label':'Calendar'},
                            children:Array.from({length:42}).map(item => {return {class:'rjs-day', attr:{role:'gridcell'}}}),
                            on:this.o.mode === 'range' ? {
                                keydown:this.dp.e.daysGridKeydownHandler.bind(this.dp.e),
                                focus:() => this.dp.picker.querySelector('.rjs-day:first-child').classList.add('rjs-highlight'),
                                blur:() => this.dp.picker?.querySelector('.rjs-day.rjs-highlight')?.classList?.remove('rjs-highlight'),
                                click:this.dp.e.daysClickHandler.bind(this.dp.e),
                                pointerdown:this.dp.e.daysPointerdownHandler.bind(this.dp.e),
                                pointerup:this.dp.e.daysPointerupHandler.bind(this.dp.e),
                                pointerleave:this.dp.e.daysPointerleaveHandler.bind(this.dp.e),
                                pointercancel:this.dp.e.daysPointerleaveHandler.bind(this.dp.e),
                                pointermove:{
                                    handler:this.dp.e.daysPointermoveHandler.bind(this.dp.e),
                                    throttle:50
                                },
                                mousemove:{
                                    handler:this.dp.e.daysMousemoveHandler.bind(this.dp.e),
                                    throttle:50,
                                }
                            } : {
                                focus:() => this.dp.picker.querySelector('.rjs-day:first-child').classList.add('rjs-highlight'),
                                blur:() => this.dp.picker?.querySelector('.rjs-day.rjs-highlight')?.classList?.remove('rjs-highlight'),
                                keydown:this.dp.e.daysGridKeydownHandler.bind(this.dp.e),
                                click:this.dp.e.daysClickHandler.bind(this.dp.e),

                            }
                        },
                    ]},
    
                    {class:'rjs-btns', children:[
                        {tag:'button', class:'rjs-clearBtn', text:this.dp.locale.clear, on:{click:this.dp.c.clear.bind(this.dp.c)}},
                        { tag:'button', class:'rjs-applyBtn', text:this.dp.locale.apply, on:{click:this.dp.c.apply.bind(this.dp.c)}},
                    ]}

                ]
            }
    }
    
}
