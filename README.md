# Console Craft

## Independent software studio by Ovi Ispas

Console Craft is an independent software playground by Ovi Ispas, focused on experiments, demos, and exploring AI-powered apps, developer tools, and emerging technologies.

Born in the console, evolved to production.

## Development

```sh
bun install
bun run dev
```

Run `bun run build` before publishing. The site is statically generated into `dist/` and deployed to GitHub Pages by the existing workflow.

## Writing Blog Articles

Blog articles are Markdown files in `src/content/blog/`. Put series articles in a folder matching the series slug:

```text
src/content/blog/building-agents/context-engineering.md
```

This produces `/blog/building-agents/context-engineering/`. Use lowercase, hyphenated folder and file names because they become the public URL.

Every article starts with frontmatter:

```yaml
---
title: "Context Engineering for Useful Agents"
description: "How to give an agent the right information at the right time."
pubDate: 2026-08-04
updatedDate: 2026-08-08 # optional
draft: true
upcoming: false
series:
  title: Building Useful Agents
  order: 1
---
```

- Set `draft: true` while writing. A non-upcoming draft is linked and previewable locally, but is absent from production routes and listings.
- Set `upcoming: true` to announce a future series article. Upcoming entries appear in the production series listing with their title, description, and part number, but have no link or publication date.
- Use `upcoming: true` with `draft: true` when previewable article content exists. The index links to it in development, while production still shows only the disabled announcement.
- Use `upcoming: true` with `draft: false` for an announcement-only entry. It has no route in development or production.
- `pubDate` is required only for published articles where both `upcoming` and `draft` are `false`. Upcoming entries must include `series`.
- To publish an upcoming article, set both `upcoming: false` and `draft: false`, then add `pubDate`.
- Omit `series` for a standalone article.
- Keep part numbers unique and sequential inside a series folder. They control listing order and previous/next links.
- Start article sections at `##`. The article title comes from frontmatter, and `##`/`###` headings populate the in-page content map.
- Add a language such as `ts` after the opening fenced code marker for syntax highlighting.
- Store article-specific images alongside content only when needed. The shared article header uses `src/assets/blog/article-hero.jpg` and is optimized once in `src/layouts/BlogPost.astro`.

`src/content/blog/building-reliable-tools/foundations.md` is a development-only draft that exercises the article typography, content map, tables, and highlighted code. It is safe to keep as an authoring reference or replace with the first real series.
