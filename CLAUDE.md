# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Carles Matoses' personal portfolio/blog, a Jekyll site deployed to GitHub Pages. Content is computer-graphics, VFX, and Blender posts, plus references/transcriptions of YouTube videos. Deployment is automatic via `.github/workflows/jekyll.yml` on every push to `main` (builds with `bundle exec jekyll build`, `JEKYLL_ENV=production`, `submodules: recursive`).

## Commands

```bash
bundle install
bundle exec jekyll serve --drafts --force_polling   # local dev, includes _drafts, http://localhost:4000
bundle exec jekyll build --trace --verbose          # what CI runs
./start-jekyll.sh                                    # Docker alternative (livereload on :4000, autodetects docker/docker-compose)
```

There is no test suite, linter, or JS build step — a green `jekyll build` is the only check. When touching plugin Ruby code or `_config.yml`, restart the server (Jekyll does not hot-reload either).

## Architecture

**Two-track content model.** Everything under `_posts/` is a post, but the front matter `categories:` field splits them into two audiences: `project` and `post`. `_layouts/index.html` renders three Bootstrap pill tabs (Projects / Posts / About me), each populated by `_includes/post_list.html` filtered on that category. `_posts/` is further organized into `posts/` and `projects/` subdirs, but **the category field, not the directory, is what drives display.** The active tab is also controllable via URL query (`?posts`, `?projects`, `?about`) — JS in `index.html` syncs tab state to the URL both ways.

**Card previews rely on a content convention.** `_includes/default_card.html` and `_layouts/post.html` both split `page.content` on the literal marker `<!-- end-abstract -->`. Text before the marker is the card abstract / post intro; text after is the full body. New posts should include this marker. Cards also read `post.preview` (thumbnail image path) and `post.e_permalink` (external link, e.g. a YouTube URL — used instead of the internal permalink when present).

**The `jekyll-skcg` plugin (git submodule) is the core of the writing experience.** Located at `_plugins/jekyll-science-kit-computer-graphics/` (submodule from a separate repo — clone with `--recursive` or run `git submodule update --init`). It provides LaTeX-like Liquid tags for scientific/CG writing:
- `{% figure id="x" size="0.8" caption="..." %}...path...{% endfigure %}` and `{% ref figure:x %}` for numbered, referenceable figures
- `{% bibliography_loader _bibliography/references.bib %}` + `{% cite key %}` for BibTeX citations
- `{% glb_viewer id="m" models="/assets/models/scene.glb" %}` for interactive 3D
- Bootstrap-style alert blocks and numbered equations

Two plugin behaviors to know:
- `AssetGenerator` copies the gem's CSS/JS into `assets/jekyll-skcg/` at build time. This directory is **git-ignored and auto-generated** — do not edit or commit it.
- `ScriptInjector` (a post-render hook) injects Three.js + related CDN scripts into `</head>` **only on pages whose output contains `glb-viewer`**. Don't manually add Three.js to layouts.

**Local one-off plugins** live directly in `_plugins/` (`bibtex_parser.rb` provides a simpler `{% bibliography %}` tag; `render_time.rb` is a demo `{% render_time %}` block). These are separate from and predate the submodule plugin — prefer the submodule's `bibliography_loader`/`cite` tags for real citation work.

**Rendering stack in layouts:** Bootstrap 5.0.2 (vendored under `assets/bootstrap-5.0.2-dist/`), Font Awesome 4 (CDN), KaTeX for math (`$...$` inline, `$$...$$` display — configured in `_layouts/post.html`), and Mermaid (CDN, `_layouts/post.html`). CSS is split per-concern under `assets/css/` (`main.css`, `index.css`, `post.css`, `post-preview.css`, `footer.css`).

## Content workflow

- Drafts go in `_drafts/` (no date in filename); serve with `--drafts` to preview. Move to `_posts/posts/` or `_posts/projects/` with a `YYYY-MM-DD-title` filename to publish.
- Bibliography sources are in `_bibliography/` (`references.bib`, `ao_references.bib`).
- Post images live in `images/`; other static assets in `assets/`.
