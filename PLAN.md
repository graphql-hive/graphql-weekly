## Next Steps

- Compare bundle size and lighthouse audit against production
- Space component is not idiomatic in Tailwind. Its callsites should be inlined
- Remove all frivolous concatenation from `cn` calls. Concatenate only if there is a condition, otherwise keep long strings for greppability.
  - Better yet,

## Notes

- `colorSchema` is always `'dark'` - simplify conditionals, use dark branch only, drop dead code
- `primary`, `primaryLight1-3`, `primaryDark1` undefined even in production master - dead code, remove
- Breakpoint: 1000px (mobile ≤1000px, desktop ≥1001px)
- Dynamic colors (topicColor, primaryColor props): use inline styles or CSS custom properties

## Someday/Maybe

- Migrate the write API from Netlify Functions (`graphqlweekly-api.netlify.app`) to Cloudflare Workers
