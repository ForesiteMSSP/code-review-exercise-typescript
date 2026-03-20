# Code Review Exercise

A small React application that simulates a Jira-like issue tracker.

The app displays issues organized by project, with three hardcoded projects: **Project Alpha**, **Project Beta**, and **Project Secret**. The first two are accessible in the app, the Secret project is not. Issue data is stubbed — there is no real Jira integration.

## Tech Stack

- **React** with **TypeScript**
- **React Router 7** (framework mode with SSR)
- **Tailwind CSS** for styling
- **Vitest** for testing
- **ESLint** for linting
- **Prettier** for formatting
- **pnpm** as the package manager

## Prerequisites

- [Node.js](https://nodejs.org/) v24.14.0 or later
- [pnpm](https://pnpm.io/) v10 or later

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `pnpm dev`          | Start development server     |
| `pnpm build`        | Build for production         |
| `pnpm start`        | Start production server      |
| `pnpm test`         | Run tests                    |
| `pnpm test:watch`   | Run tests in watch mode      |
| `pnpm lint`         | Run ESLint                   |
| `pnpm format`       | Format code with Prettier    |
| `pnpm format:check` | Check formatting             |
| `pnpm typecheck`    | Run TypeScript type checking |

## Running with Docker

Build the Docker image:

```bash
docker build -t code-review-exercise .
```

Run the container:

```bash
docker run -p 3000:3000 code-review-exercise
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  data/             # Static JSON stub data
  services/         # Data access layer (stubbed Jira API)
  routes/           # React Router route modules
  root.tsx          # Root layout with project switcher
  routes.ts         # Route configuration
  app.css           # Tailwind CSS entry point
```

## License

[MIT](LICENSE)
