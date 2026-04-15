# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Block Dash (Mobile Game) — `artifacts/block-dash`
- **Type**: Expo React Native mobile app
- **Route**: `/` (preview path)
- **Description**: Block Blast / Woodoku-style block puzzle game
- **Features**:
  - 10x10 grid board with drag-and-drop block pieces
  - 35+ piece shapes (all rotations: L, T, S, Z, squares, lines, corners, plus)
  - Row and column line clearing with simultaneous combo detection
  - Combo system with multipliers (×1.5 up to ×4)
  - Animated score display, combo indicator, and particle effects
  - Game over detection (no more valid placements)
  - High score and game stats persisted via AsyncStorage
  - Save/resume game state
  - Haptic feedback on pickup, placement, clear, error
  - Settings screen (haptics toggle, sound toggle, reset stats)
  - Home screen with floating animated blocks background
  - Dark theme with vibrant color palette (8 piece colors)
  - Game Over modal with share, play again, home actions
- **Structure**:
  - `src/utils/` — constants, pieces, gameHelpers, storage
  - `src/context/` — GameContext (game state), SettingsContext
  - `src/components/` — GameBoard, BlockPiece, ScoreBoard, ComboIndicator, GameOverModal, ParticleEffect, FloatingBlock
  - `src/screens/` — HomeScreen, GameScreen, SettingsScreen
  - `app/` — expo-router routes (index, game, settings)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/block-dash run dev` — run the game locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
