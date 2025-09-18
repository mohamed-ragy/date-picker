# @ragyjs/date-picker
[![npm](https://img.shields.io/npm/v/@ragyjs/date-picker)](https://www.npmjs.com/package/@ragyjs/date-picker)
![npm](https://img.shields.io/npm/dm/@ragyjs/date-picker)
[![GitHub release](https://img.shields.io/github/v/release/mohamed-ragy/date-picker)](https://github.com/mohamed-ragy/date-picker/releases)
![GitHub license](https://img.shields.io/github/license/mohamed-ragy/date-picker)


### A lightweight, modern, and responsive date picker for web apps — supports single and range selection, built-in presets (Today, Last 7 Days, etc.), flexible theming with CSS variables, and full keyboard and screen reader accessibility. Framework‑agnostic. Zero peer dependencies. Ships with one small runtime helper (`@ragyjs/dom-renderer`) that installs automatically.

## Try the live demo → [View Demo](https://ragyjs.com/date-picker)

![Demo](https://raw.githubusercontent.com/mohamed-ragy/date-picker/main/assets/demo.png)

# Documentation

## Table of Contents
1. [What is this?](#what-is-this)
2. [Features](#features)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [Core Concepts](#core-concepts)  
6. [Styling & Theming](#styling--theming)  
7. [Options](#options)  
8. [Methods (Public API)](#methods-public-api)  
9. [Localization](#localization-i18n)  
10. [Accessibility](#accessibility)  
11. [Recipes](#recipes)   
12. [Framework Usage](#framework-usage)  
13. [Performance](#performance)  
14. [FAQ](#faq)  
15. [License](#license)

## What is this?
This is a modern, responsive date picker that works in any web project.
It supports both single date and date range selection, and comes with helpful presets like “Today”, “Last 7 Days”, and others ready to use.

The styling is fully customizable using simple CSS variables.
Keyboard navigation and screen reader support are built in.
It uses a minimal rendering helper under the hood (@ragyjs/dom-renderer), but has no other dependencies — no frameworks, no large libraries.

You can drop it into any page, connect it to your logic, and it just works.
If you're building a dashboard, analytics filter, or anything that needs a clean, flexible way to pick dates, this tool was made for that.

## Features
- Supports both single date and date range selection
- Includes built-in presets like “Today”, “Last 7 Days”, “This Month”, etc.
- Works with any framework — or no framework at all
- Fully responsive layout, adapts to small screens
- Easy to customize with CSS variables
- Accessible by keyboard and screen readers
- Simple, unopinionated design — style it your way
- Lightweight: uses only a small DOM renderer (@ragyjs/dom-renderer)
- Fast to load, no extra dependencies
- Supports localization and custom language overrides
- Clean API for integration, with useful events and methods

## Installation

Install the package using your preferred package manager:

```bash
npm install @ragyjs/date-picker
# or
pnpm add @ragyjs/date-picker
# or
yarn add @ragyjs/date-picker
```

### Importing

Import the JavaScript module and the CSS file into your project:

```js
import { DatePicker } from '@ragyjs/date-picker';
import '@ragyjs/date-picker/style.css';
```

The package is ESM-only. You can use it in any modern frontend stack (Vite, Webpack, etc.) or plain `<script type="module">` in the browser.

**SSR note:** Import is safe in SSR, but only create the picker in the browser (e.g., inside `useEffect`/`onMounted`).

## Quick Start

Here’s how to get a date picker up and running in a few lines of code.

You can use it in **single** or **range** mode depending on your needs.

### Single date picker

```js
import { DatePicker } from '@ragyjs/date-picker';
import '@ragyjs/date-picker/style.css';

const container = document.querySelector('#single-picker');

new DatePicker(container, {
  mode: 'single',
  placeholder: 'Select a date',
  onApply: (date) => {
    // Returns a single date object: { day, month, year }
    console.log('Selected date:', date);
  }
});
```

### Range picker with presets

```js
import { DatePicker } from '@ragyjs/date-picker';
import '@ragyjs/date-picker/style.css';

const container = document.querySelector('#range-picker');

new DatePicker(container, {
  mode: 'range',
  placeholder: 'Pick a date range',
  maxRange: 30,
  onApply: (range) => {
    // Returns an array: [startDate, endDate], each as { day, month, year }
    console.log('Selected range:', range);
  }
});
```

You can also call `.format()` on the picker instance to get the selected value(s) as strings:

```js
const picker = new DatePicker(container, { mode: 'single' });
const formatted = picker.format('dd-mm-YYYY'); // "07-10-2025"
```

If you're using presets like “Last 7 Days” or “This Month”, the range is filled automatically when selected.

## Core Concepts

Before you dive deeper, here are a few things to understand about how this date picker works.

### Date object shape

Instead of using native JavaScript `Date` objects, this picker uses plain date objects in the following format:

```js
{ day: 7, month: 10, year: 2025 }
```

- `month` is 1-based (January = 1, December = 12)
- This format is easy to serialize, compare, and use across time zones

You’ll receive this format from `onApply`, and you’ll also use it when passing in default `value`.

### Modes: single vs. range

You can choose between two modes:

- `'single'` — the picker lets users select just one date  
- `'range'` — the picker shows a two-part range selector with optional presets

The value returned by `onApply` depends on the mode:

- Single mode returns a date object: `{ day, month, year }`
- Range mode returns an array: `[startDate, endDate]`

### Inclusive ranges

All date ranges are inclusive.  
If a user selects “October 1” to “October 7”, the range includes both dates.

### Presets

In range mode, the picker includes useful presets by default:

- Today  
- Yesterday  
- Last 7 Days  
- This Week  
- Last Month  
- This Year  
- ...and more

When a user selects a preset, the value updates automatically.

### Start of week

By default, weeks start on **Sunday (0)**, but you can change that with the `startOfWeek` option.

```js
startOfWeek: 1 // makes Monday the first day of the week
```

You can also pass strings like `'mon'`, `'tue'`, etc.



## Styling & Theming

The date picker is styled entirely using **CSS variables**, so it’s easy to customize and theme without touching the JavaScript.

### CSS import

The picker **requires** its CSS file to be included. Without it, the component will render without styles.

Make sure you import the CSS file in your app:

```js
import '@ragyjs/date-picker/style.css';
```

This file defines the layout, theming, animations, and responsive behavior of the picker.

### Built-in themes

The picker currently includes the following built-in theme:

- `cerulean` – clean and light with a blue highlight (default)
- `raspberry` – bold and playful with raspberry tones
- `viridian` – calm green and neutral gray tones
- `caribbean` – fresh and vibrant, inspired by tropical waters
- `dark` – dark mode theme with soft contrast

You can apply it explicitly:

```js
new DatePicker(container, {
  theme: 'cerulean'
});
```


### Custom themes with CSS variables

You can fully customize the look of the picker by defining your own CSS theme using variables.  
Each theme is applied by targeting `.rjs-datePicker.rjs-yourThemeName`.

Here’s an example:

```css
.rjs-datePicker.rjs-customTheme {
  --color-primary: #0055cc;                 /* Main color */
  --color-background: #ffffff;              /* Main background of the picker */
  --color-background-alt: #f0f0f0;          /* Background of hover/focus states */
  --color-background-skeleton: #00000005;   /* Shimmer background while loading */
  --color-text: #1a1a1a;                    /* Text color for labels and days */
  --color-border: #d0d0d0;                  /* Border color */
  --color-placeholder: #999999;             /* Placeholder and dimmed text */
  --color-icons: #888888;                   /* Icons stroke color */
  --color-error: #d00000;                   /* Error message color */
  --shadow-day: 0px 0px 4px #00000023;      /* Hover shadow on day cells */
  --shadow-button: 0px 0px 2px #00000023;   /* Shadow on buttons */
}
```

Then apply the theme:

```js
new DatePicker(container, {
  theme: 'customTheme'
});
```

You can define as many themes as you like and switch them based on context or user preference.

### CSS variables available

Here’s the full list of CSS variables you can override:

- `--color-primary`  
- `--color-background`  
- `--color-background-alt`  
- `--color-background-skeleton`  
- `--color-text`  
- `--color-border`  
- `--color-placeholder`  
- `--color-icons`  
- `--color-error`  
- `--shadow-day`  
- `--shadow-button`


## Options

You can pass options as the second argument when creating a new picker:

```js
new DatePicker(container, { ...options });
```

Here’s a complete list of available options:

### mode

- **Type**: `'single' | 'range'`
- **Default**: `'single'`
- **What it does**:  
  Defines whether the picker selects a single date or a date range.

---

### value

- **Type**:  
  - In `'single'` mode: `{ day, month, year }`  
  - In `'range'` mode: `[startDate, endDate]` (same format)
- **What it does**:  
  Sets the initial selected value. Useful for pre-filling the picker with a known date or range.

---

### placeholder

- **Type**: `string`
- **Default**: `''`  
- **What it does**:  
  Text shown when no date is selected yet.

---

### label

- **Type**: `string`
- **What it does**:  
  Adds a visible label above the picker input.

---

### format

- **Type**: `string`
- **Default**: `'dd-M-YY'`
- **What it does**:  
  Controls how dates are displayed inside the input.  
  You can use tokens like `dd`, `mm`, `YYYY`, `M`, `D`, etc.  
  See [Localization](#localization-i18n) for full token list.

---

### theme

- **Type**: `string`
- **Default**: `'cerulean'`
- **What it does**:  
  Applies a built-in or custom theme by name.  
  See [Styling & Theming](#styling--theming) for available themes.

---

### style

- **Type**: `object`
- **What it does**:  
  Adds inline styles directly to the `.rjs-datePicker` container.  
  Useful for quick tweaks or dynamic width/height.

---

### locale

- **Type**: `string`
- **Default**: `'en'`
- **What it does**:  
  Selects one of the built-in locales (e.g., `'fr'`, `'ar'`, `'de'`).  
  See [Localization](#localization-i18n) for supported codes.

---

### trans

- **Type**: `object`
- **What it does**:  
  Allows you to override or define custom translation labels.  
  You can override only some keys, or provide a full set.

---

### startOfWeek

- **Type**: `number | string`
- **Default**: `0` (Sunday)
- **What it does**:  
  Defines which day starts the week (`0` = Sunday, `1` = Monday, etc.), or pass `'mon'`, `'tue'`, etc.

---

### minDate

- **Type**: `{ day, month, year }`
- **What it does**:  
  Limits how early users can select dates.  

---

### maxDate

- **Type**: `{ day, month, year }`
- **What it does**:  
  Limits how late users can select dates.  
  
---

### maxRange

- **Type**: `number` (days)
- **What it does**:  
  In range mode, limits how long the selected range can be.  
  The range is inclusive (e.g., `7` means start + 6 days).

---

### onApply

- **Type**: `(value) => void`
- **When it fires**:  
  When the user clicks the **Apply** button.

- **Value shape**:  
  - In single mode: `{ day, month, year }`  
  - In range mode: `[startDate, endDate]`

---

### onPick

- **Type**: `(value) => void`
- **When it fires**:  
  When the user selects a day or changes the range (before clicking Apply).

- **Value shape**:  
  Same as `onApply`.

---

### onClear

- **Type**: `() => void`
- **When it fires**:  
  When the user clicks the **Clear** button.

## Methods (Public API)

When you create a new picker, it returns an instance with several helpful methods:

```js
const picker = new DatePicker(container, options);
```

You can use the following methods to interact with it programmatically.

---

### picker.value

- **Type**:  
  - In `'single'` mode: `{ day, month, year }`  
  - In `'range'` mode: `[startDate, endDate]`
- **What it does**:  
  Returns the current selected value.

---

### picker.set(value, silent = true)

- **Type**:  
  - `value`: a date or range (same format as `value` option)  
  - `silent`: if `true`, suppresses `onPick`
- **What it does**:  
  Sets the selected date(s) manually.  
  Useful for reactive updates or resets.

```js
picker.set({ day: 12, month: 9, year: 2025 });
```

---

### picker.format(formatString)

- **Returns**:  
  - A string (in single mode)  
  - An array of strings (in range mode)
- **What it does**:  
  Formats the selected date(s) as strings using the specified format.  
  See [Localization](#localization-i18n) for available tokens.

```js
picker.format('dd/mm/YYYY'); // → "12/09/2025"
```

---

### picker.focus()

- **What it does**:  
  Opens the picker and focuses the root element.  
  Use this if you want to open the picker programmatically.

---

### picker.blur()

- **What it does**:  
  Closes the picker and removes focus.

---

### picker.nextMonth(callback?)

- **What it does**:  
  Moves the view to the next calendar month.  
  Calls `callback()` after animation completes (optional).

---

### picker.prevMonth(callback?)

- **What it does**:  
  Moves the view to the previous calendar month.  
  Calls `callback()` after animation completes (optional).

---

### picker.selectPeriod(periodName, silent = true)

- **What it does**:  
  Selects one of the built-in presets by name (e.g., `"today"`, `"last7days"`).  
  Use `silent: false` to trigger `onPick`.

- **Available period names**:
  - `'today'`
  - `'yesterday'`
  - `'last7days'`
  - `'last30days'`
  - `'last90days'`
  - `'thisWeek'`
  - `'thisMonth'`
  - `'thisYear'`
  - `'lastWeek'`
  - `'lastMonth'`
  - `'lastYear'`
  - `'custom'`
  
```js
picker.selectPeriod('last30days');
```

---

### picker.startLoading()

- **What it does**:  
  Visually disables the picker and shows a loading shimmer.  
  Useful if you're waiting for external data.

---

### picker.stopLoading()

- **What it does**:  
  Hides the loading state and makes the picker interactive again.

---

### picker.error(message, focus = false)

- **What it does**:  
  Shows an error message below the picker.  
  If `focus` is `true`, the picker will also open.

```js
picker.error('Invalid range', true);
```

---

### picker.clearError()

- **What it does**:  
  Removes any visible error message.

---

### picker.destroy()

- **What it does**:  
  Completely removes the picker and all attached listeners.  
  Call this if you need to clean up.

## Localization (i18n)

The date picker supports multiple languages and custom labels. You can choose from built-in locales or override the text yourself.

### Built-in locales

You can set the `locale` option to one of the supported language codes:

- `'en'` — English (default)  
- `'fr'` — French  
- `'es'` — Spanish  
- `'de'` — German  
- `'uk'` — Ukrainian  
- `'ar'` — Arabic  
- `'it'` — Italian  
- `'pt'` — Portuguese  
- `'zh'` — Chinese  
- `'ja'` — Japanese

```js
new DatePicker(container, {
  locale: 'de'
});
```

This updates all buttons, labels, month names, weekdays, and presets.

---

### Custom translations with `trans`

You can override any label using the `trans` option. This works with or without setting `locale`.

```js
new DatePicker(container, {
  trans: {
    apply: 'OK',
    today: 'Now',
    last7days: 'Past 7 Days'
  }
});
```

#### Available keys you can override:

```js
{
  clear: 'Clear',
  apply: 'Apply',
  today: 'Today',
  yesterday: 'Yesterday',
  last7days: 'Last 7 days',
  last30days: 'Last 30 days',
  last90days: 'Last 90 days',
  thisWeek: 'This week',
  thisMonth: 'This month',
  thisYear: 'This year',
  lastWeek: 'Last week',
  lastMonth: 'Last month',
  lastYear: 'Last year',
  custom: 'Custom',
  weekdays: [...],         // e.g. ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  weekDaysShort: [...],    // e.g. ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  weekDaysLong: [...],     // e.g. ['Sunday', 'Monday', ...]
  monthsShort: [...],      // e.g. ['Jan', 'Feb', ...]
  monthsLong: [...]        // e.g. ['January', 'February', ...]
}
```

If you're customizing any of the array fields (`weekdays`, `weekDaysShort`, `weekDaysLong`, `monthsShort`, `monthsLong`), make sure your arrays:

- Have the same number of items as the default (7 for weekdays, 12 for months)
- Are in the correct order:  
  - Weekdays start from Sunday (`Su`, `Mo`, `Tu`, ...)  
  - Months start from January (`Jan`, `Feb`, ...)

This ensures the calendar grid stays correct.

---

### Formatting dates with `.format()`

The `.format()` method lets you convert the selected date(s) into a string, using tokens like `dd`, `mm`, `YYYY`, etc.

```js
picker.format('dd/mm/YYYY'); // → "17/10/2025"
```

This does **not** change how dates are displayed inside the picker — it’s only for formatting output when you need a specific string format (e.g., to send in a request or show somewhere else).

To control the **display inside the picker**, use the `format` option when creating it.

---

### Supported tokens for `.format()`

| Token   | Meaning            | Example         |
|---------|--------------------|-----------------|
| `d`     | Day (no zero)      | 5               |
| `dd`    | Day (2 digits)     | 05              |
| `m`     | Month (no zero)    | 9               |
| `mm`    | Month (2 digits)   | 09              |
| `M`     | Month short name   | Sep             |
| `MM`    | Month full name    | September       |
| `YY`    | 2-digit year       | 25              |
| `YYYY`  | 4-digit year       | 2025            |
| `D`     | Weekday short name | Tue             |
| `DD`    | Weekday full name  | Tuesday         |

These tokens are localized automatically based on the selected locale or your custom `trans` object.


## Accessibility

The date picker is designed to be fully accessible out of the box — no extra configuration needed.

### Keyboard navigation

Users can navigate and interact using only the keyboard:

- `Arrow keys`: move across days
- `Enter` or `Space`: select a date
- `Escape`: close the picker
- `Tab` and `Shift+Tab`: move between focusable areas

In range mode, the keyboard highlights update dynamically as users move.

### Screen reader support

The picker uses semantic HTML roles and ARIA attributes to provide meaningful information to screen readers:

- The main wrapper uses `role="button"` and `aria-expanded` to indicate state
- The calendar grid uses `role="grid"` and `role="gridcell"` for day cells
- Selected and focused states use `aria-selected` appropriately
- All buttons and icons have accessible labels

There’s also a live region (`aria-live="polite"`) to announce updates when months or values change.

### Focus behavior

When the picker opens, its content becomes focusable and keyboard-friendly.  
When it closes, the internal content becomes inert so you can’t tab into it by mistake.

## Recipes

Here are some useful patterns you can apply when using the picker in real projects.

### Controlled value (update manually)

You can update the selected date programmatically at any time using `.set()`:

```js
const picker = new DatePicker(container, { mode: 'single' });

// Later in your code
picker.set({ day: 10, month: 12, year: 2025 });
```

In range mode:

```js
picker.set([
  { day: 1, month: 10, year: 2025 },
  { day: 15, month: 10, year: 2025 }
]);
```

---

### Clear selection

To clear the picker value manually:

```js
picker.set([null, null]); // works for both single and range
```

You can also let the user click the built-in **Clear** button and handle it with `onClear`.

---

### Show error state

You can show a temporary error message below the picker:

```js
picker.error('Invalid date selected');
```

You can remove it with:

```js
picker.clearError();
```

---

### Format date(s) for display or requests

If you need to send a formatted string somewhere (e.g., for a search filter), use `.format()`:

```js
const value = picker.format('YYYY-mm-dd');
// Returns string in single mode or array in range mode
```

This doesn’t affect how dates appear inside the picker — it’s just for output.

---

### Set a preset programmatically

You can select one of the built-in presets with `.selectPeriod()`:

```js
picker.selectPeriod('last7days');
```

This will update the value and UI instantly. You can pass `false` to trigger `onPick`.

---

### Limit date range to the past 30 days

```js
new DatePicker(container, {
  mode: 'range',
  maxRange: 30,
  maxDate: { day: 1, month: 11, year: 2025 }
});
```

This ensures users can’t select more than 30 days, and not beyond November 1st, 2025.

---

### Change theme dynamically

If you want to switch themes at runtime:

```js
picker.picker.classList.remove('rjs-cerulean');
picker.picker.classList.add('rjs-dark');
```

Just make sure the theme exists in your CSS.

## Framework Usage

The date picker works with any frontend framework — or no framework at all.  
It doesn't rely on global DOM access, jQuery, or custom lifecycle hooks.

You create it by passing in a DOM element and options.  
It can be used in React, Vue, Svelte, or plain HTML with no wrappers.

---

### Vanilla JavaScript

```js
const container = document.querySelector('#picker');

const picker = new DatePicker(container, {
  mode: 'single',
  onApply: (date) => {
    console.log('Picked date:', date);
  }
});
```

---

### React (useEffect example)

```jsx
import { useEffect, useRef } from 'react';
import { DatePicker } from '@ragyjs/date-picker';
import '@ragyjs/date-picker/style.css';

function DatePickerComponent() {
  const ref = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    pickerRef.current = new DatePicker(ref.current, {
      mode: 'range',
      onApply: (range) => {
        console.log(range);
      }
    });

    return () => {
      pickerRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} />;
}
```

---

### Vue (with `onMounted`)

```vue
<template>
  <div ref="pickerEl"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { DatePicker } from '@ragyjs/date-picker';
import '@ragyjs/date-picker/style.css';

const pickerEl = ref();
let picker;

onMounted(() => {
  picker = new DatePicker(pickerEl.value, {
    mode: 'single',
    onApply: (date) => {
      console.log(date);
    }
  });
});

onBeforeUnmount(() => {
  picker?.destroy();
});
</script>
```

---

### Notes

- Make sure to call `.destroy()` when your component unmounts, especially in React/Vue/Svelte apps.
- You can use multiple instances on the same page — each is isolated.

## Performance

The picker is lightweight and doesn’t ship any third-party libraries.

- There are **no re-renders** — the component only updates when needed
- DOM updates are minimal and scoped to what changes (no full redraws)
- It’s safe to use multiple instances on the same page

If you're building complex or high-traffic UIs, the picker stays responsive and cheap to run — even when embedded in large dashboards or filters.

## FAQ / Troubleshooting

### The picker renders but looks broken or unstyled

Make sure you’ve imported the required CSS file:

```js
import '@ragyjs/date-picker/style.css';
```

The picker relies on CSS variables for layout and theming. Without this file, it won't display correctly.

---

### Dates look off by one day

Make sure you're using the correct date format:

```js
{ day: 5, month: 10, year: 2025 } // month is 1-based
```

Month numbers start from 1 (January = 1, December = 12).

---

### The picker doesn't open when I click it

Ensure that the root container is in the document and focusable.  
If you're using custom styles or animation wrappers, check that the `.rjs-datePicker` is visible and not inside a hidden/inert element.

Also make sure you're not disabling focus by accident (e.g., missing `tabindex`).

---

### I want to disable weekends or specific days

This feature isn’t built-in yet, but you can use CSS or logic inside `onPick()` to detect and handle blocked dates manually.

Support for `disabledDates` and `disabledWeekdays` is planned.

---

### How do I format the selected date?

Use `.format()` to return the selected date(s) as a string:

```js
picker.format('YYYY-mm-dd');
```

This does **not** change the display inside the picker.  
To change how the date appears inside the UI, use the `format` option.

---

### Can I use it without a framework?

Yes — it works with plain JavaScript.  
Just pass a DOM element and some options:

```js
new DatePicker(document.querySelector('#picker'), { mode: 'single' });
```

---

### Can I have more than one picker on the page?

Yes — multiple pickers are fully supported. Each instance is isolated and independent.

---

### How do I remove a picker when I’m done?

Call `.destroy()` on the instance:

```js
picker.destroy();
```

This will remove all DOM listeners and references.

## License

This project is open source and available under the MIT License.

You can use it freely in personal or commercial projects, modify it, or redistribute it — just keep the original license file and attribution.

For full details, see the [LICENSE](./LICENSE) file.