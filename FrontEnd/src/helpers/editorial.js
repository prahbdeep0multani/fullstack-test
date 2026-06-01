// ── Editorial design system ──────────────────────────────────────
// All theme-aware colors live in Tailwind classes: `text-ink`, `border-edge-2`, etc.
// CSS variables are defined in styles/app.css and flip with .dark on <body>.

export const EYEBROW = 'text-[10px] tracking-[0.15em] uppercase font-medium font-sans text-ink-3';
export const EYEBROW_SM = 'text-[9px] tracking-[0.12em] uppercase font-medium font-sans text-ink-3';
export const PAGE_TITLE = 'text-[38px] font-normal leading-[1.1] tracking-tight font-serif text-ink';
export const HERO_NUMBER = 'text-[clamp(52px,7vw,76px)] font-light leading-none -tracking-[0.02em] font-serif';
export const SUB_NUMBER = 'text-[22px] font-semibold font-serif';
export const PILL_BASE =
  'px-[14px] py-1 rounded-full border text-[11px] tracking-[0.06em] uppercase font-medium font-sans cursor-pointer transition-all';
export const PILL_INACTIVE = 'bg-transparent border-edge-2 text-ink-2 hover:text-ink hover:border-edge';
export const PILL_ACTIVE = 'bg-primary border-primary text-white';
export const PAGE = 'p-10 lg:px-12 font-sans';
export const PAGE_MOBILE = 'pt-16 px-5 pb-8 font-sans';

// ── Currency formatter ──────────────────────────────────────────
export const fmtCents = (cents, locale = 'it-IT') =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Math.abs((cents || 0) / 100)
  );

// ── Static palette (financial — same in light & dark) ──────────
export const COLOR_INCOME = '#16a34a';
export const COLOR_EXPENSE = '#dc2626';
export const COLOR_INCOME_SOFT = '#22c55e';
export const COLOR_EXPENSE_SOFT = '#ef4444';
