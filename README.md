# [Bangalore bikes](https://bangalorebikes.com/) landing website

This repository serves as the development house for [r/BangaloreBikes](https://www.reddit.com/r/bangalorebikes/) official website. People can access preferable Ride locations conveniently, Emergency contacts page in the city, Dos and don’ts of communication, Ride safety information, Shipping related useful information, and other tips and helpful features related to biking.

## Getting Started

This is a Next.js v15 application. We are using app router.

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project structure

```
src/app/            one folder per route: /, /rides, /gallery, /wiki, /blog, /about, /sos
src/components/     UI, grouped by feature (layout, home, rides, gallery, wiki, blog, common)
src/data/           all site content: rides, destinations, gallery, wiki, posts, SOS contacts
src/app/globals.css design tokens (colours, fonts, animations) for the dark and light themes
```

Content edits (a new ride, a new destination, a wiki rule, an emergency number) are data
changes only: edit the matching file in `src/data/` and nothing else needs to move.

Styling uses Tailwind v4 against the tokens in `globals.css` (`bg-bg2`, `text-fg2`,
`border-line`, `text-acc`, `bg-sos`, `font-display`). Do not hardcode hex values: both
themes read the same token names.

## Deciding what to work on

Check out the [issues](https://github.com/Bangalore-bikes/bangalore-bikes-landing/issues) tab, pick an issue that hasn't been assigned to anyone and you can start contributing

## Deployment

Project is currently hosted at [bangalorebikes.com](https://bangalorebikes.com/) as a [Netlify](https://www.netlify.com/) project.
