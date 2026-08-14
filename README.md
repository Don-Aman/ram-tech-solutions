# RAM Tech Solutions PLC — Website

Static marketing site (HTML/CSS/JS, no build step). Theme: gold + persian red on warm black, from the RAM crest.

## Features
- Unique scroll-reveal animation per section (zoom-blur, orbit-in, slide, flip) via IntersectionObserver — re-triggers on scroll.
- Horizontal "Trusted by" marquee carousel (pauses on hover).
- Services + live systems: RAM Workspace ERP, Tavola QR Menu, RIBZ marketplace.
- Fully responsive, `prefers-reduced-motion` respected.

## Run locally
Open `index.html`, or: `npx serve .`

## Deploy (Vercel)
No config needed — it's static. Either:
- Import the GitHub repo at vercel.com (framework preset: **Other**), or
- `npx vercel --prod` from this folder.
