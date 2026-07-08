# Super J.A.R.V.I.S.

A local-first personal AI workspace built with SvelteKit 2 and Svelte 5. The application combines model-agnostic chat, persistent memory, tasks, notes, projects, calendar events, research dossiers, skills, tools, automations, repository intelligence, learning, and an audit trail.

Chat conversations persist across restarts. Explicit statements such as “remember that…”, “I prefer…”, and “my goal is…” are extracted into traceable local memory. Research can synthesize user-provided source excerpts without inventing citations, while Coding analyzes only explicitly selected repository files.

The Node runtime includes a restart-safe scheduler for `daily`, `hourly`, `every N minutes`, and future ISO schedules. Automations can create tasks, notes, or local notifications. The Briefing screen combines the next 24 hours with relevance-ranked local memory; no model or network connection is required.

## Run locally

```sh
npm install
npm run dev
```

Ollama is detected at `http://localhost:11434` by default. Cloud providers remain disabled unless explicitly configured. Workspace data is stored locally in `.jarvis/workspace.json` and is excluded from Git.

## Verification

```sh
npm run check
npm run build
npm run ai:validate
```

## Safety model

Tools use capability-based risk controls. Read-only and ordinary local creation run directly; repository-changing, destructive, privileged, or external actions require an exact-input, one-time approval from the Safety screen. Controlled writes create rollback records when possible. Repository file tools reject paths outside the workspace.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/SAFETY_POLICY.md](docs/SAFETY_POLICY.md), and [docs/TOOL_REGISTRY.md](docs/TOOL_REGISTRY.md).

## Original scaffold notes

Everything you need to build a Svelte library, powered by [`sv`](https://npmjs.com/package/sv).

Read more about creating a library [in the docs](https://svelte.dev/docs/kit/packaging).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.16.2 create --template library --no-types --add tailwindcss="plugins:typography" mcp="ide:vscode,claude-code,cursor,gemini,opencode+setup:local" sveltekit-adapter="adapter:vercel" --install npm AIB
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of your library, everything inside `src/routes` can be used as a showcase or preview app.

## Building

To build your library:

```sh
npm pack
```

To create a production version of your showcase app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Publishing

Go into the `package.json` and give your package the desired name through the `"name"` option. Also consider adding a `"license"` field and point it to a `LICENSE` file which you can create from a template (one popular option is the [MIT license](https://opensource.org/license/mit/)).

To publish your library to [npm](https://www.npmjs.com):

```sh
npm publish
```
