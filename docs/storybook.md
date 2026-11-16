# Local component gallery

Run npm run storybook for the gallery on port 6006, or npm run build-storybook for a static build in storybook-static (git-ignored). These commands do not publish anything.

The gallery includes button variants, a card example, typography/palette examples, resource-directory examples with content and with no published entries, all four ride-availability states, and structured article text. Use the toolbar theme control to inspect light and dark themes.

Preview content is explicitly sample data, not published rides or recommendations.

## Compatibility

This repository uses Storybook 8 with Next.js 15. The local launcher scopes NEXT_PRIVATE_LOCAL_WEBPACK=true to the Storybook process so both tools use the installed webpack instance. Next application builds do not receive that setting.

Webpack is pinned to 5.104.1, including an override, because the older Next.js webpack integration requires internal paths absent from the newer resolved webpack package. The pin and the launcher were verified together. Upgrade Storybook, its Next adapter, and the webpack pin as a tested set rather than changing one in isolation.

The build can produce large-bundle warnings for the documentation gallery. Its static output is separate from the production Next application.

## Component checks

- Search for workshop, filter to Community, and check the no-matches state.
- Clear filters and confirm all sample entries return.
- Use the no-published-resources example to inspect the genuinely empty collection.
- Check tab order, focus visibility, wrapping at mobile widths, and both themes.

Building the gallery verifies compilation, not those browser interactions.

## Application browser smoke checks

After npm run build, start the app in a separate terminal with npm start -- -p 3102, then run npm run test:browser.

The smoke runner uses an installed Chrome/Edge browser, Node's built-in WebSocket support, and a fresh temporary profile. It connects only to localhost/127.0.0.1, never uses your personal browser session, and removes its own temporary profile afterward.

On other installations, set CHROME_PATH to your Chromium executable. SMOKE_BASE_URL can point to another local test port.

Covered: mobile menu and navigation closing, Reddit join destination, real resource search/category/reset interactions, correction link destination, contact modmail with no fake form, mobile/desktop horizontal overflow, and unknown ride/calendar 404 responses.

For populated-state checks, build Storybook too and run npm run test:browser -- --storybook. The runner serves the built gallery on a temporary loopback port, verifies upcoming/cancelled/in-progress/past ride labels and calendar visibility, then verifies structured article rendering. All event/article fixtures stay isolated from published data.

This is a focused smoke suite, not full accessibility or visual-regression coverage. It does not submit an RSVP, contact a real organizer, or send modmail.
