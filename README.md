# Omedla Tech Solutions — Website

Static marketing site (HTML/CSS/JS, no build step). Theme: blue + cyan on cool navy-black, from the Omedla triquetra mark.

## Features
- Unique scroll-reveal animation per section (zoom-blur, orbit-in, slide, flip) via IntersectionObserver — re-triggers on scroll.
- Horizontal "Trusted by" marquee carousel (pauses on hover).
- Services + live systems: ERP System, Tavola QR Menu, RIBZ marketplace.
- Fully responsive, `prefers-reduced-motion` respected.

## Run locally
Open `index.html`, or: `npx serve .`

## Deploy (Vercel)
No config needed — it's static. Either:
- Import the GitHub repo at vercel.com (framework preset: **Other**), or
- `npx vercel --prod` from this folder.
