# 🌬️ Wind Forecast Monitor

A full-stack Next.js web application that visualizes UK national wind power generation by comparing **actual vs. forecasted** values using live data from the [Elexon BMRS API](https://developer.data.elexon.co.uk/).

## Features

- 📅 Date range picker constrained to January 2024
- 🎚️ Forecast horizon slider (0–48 hours) with client-side re-merge (no extra API calls)
- 📊 Recharts line chart — actual (blue) vs forecast (green dashed)
- 📐 Stats bar: MAE, RMSE, and forecast coverage
- 🌙 Dark mode via Tailwind `dark:` classes
- 💀 Skeleton loading states
- ⚠️ Friendly error card on API failure

## Folder Structure

```
/app
  /api
    /actuals/route.ts     # Proxies Elexon FUELHH, filters WIND
    /forecasts/route.ts   # Proxies Elexon WINDFOR, filters 0–48h horizon
  layout.tsx
  page.tsx                # Main client page
/components
  ForecastChart.tsx       # Recharts line chart
  DateRangePicker.tsx     # shadcn Calendar in range mode
  HorizonSlider.tsx       # shadcn Slider
  StatsBar.tsx            # MAE / RMSE / Coverage cards
/lib
  dataUtils.ts            # filterLatestForecast, mergeData, computeStats
  types.ts                # TypeScript interfaces
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required shadcn components

If not already installed, run:

```bash
npx shadcn@latest add chart slider card calendar badge skeleton tooltip popover button
```

## Environment Variables

No environment variables are required. The Elexon BMRS API is public and does not need an API key.

## Live App

[<VERCEL_URL>](https://your-app.vercel.app)

---

> Built with assistance from AI tools for scaffolding.
