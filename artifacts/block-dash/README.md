# Block Dash

A React Native (Expo) block puzzle game inspired by Block Blast & Puzzle Masters. Place geometric pieces on a 10x10 grid, clear rows and columns to score points, and build combos for multiplied rewards.

## Setup & Running

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build

# Serve production build
pnpm run serve
```

## Project Structure

```
block-dash/
├── app/                    # Expo Router pages (file-based routing)
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Home screen route
│   ├── game.tsx           # Game screen route
│   └── settings.tsx       # Settings screen route
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── GameBoard.tsx  # 10x10 grid board
│   │   ├── BlockPiece.tsx # Individual piece renderer
│   │   ├── TraySlot.tsx   # Draggable piece tray slot
│   │   ├── ScoreBoard.tsx # Score display
│   │   ├── ComboIndicator.tsx
│   │   ├── GameOverModal.tsx
│   │   └── ParticleEffect.tsx
│   ├── context/           # React Context providers
│   │   ├── GameContext.tsx   # Game state management (reducer)
│   │   └── SettingsContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useDragAndDrop.ts # PanResponder drag-and-drop logic
│   │   ├── useSounds.ts      # Sound effect playback
│   │   └── useHaptics.ts     # Haptic feedback wrapper
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── GameScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── utils/             # Pure utility functions
│   │   ├── gameHelpers.ts # Core game logic (pure functions)
│   │   ├── pieces.ts      # Piece definitions (35+ shapes)
│   │   ├── constants.ts   # Game constants & colors
│   │   ├── storage.ts    # AsyncStorage wrapper
│   │   └── types.ts      # TypeScript type definitions
│   └── __tests__/         # Unit tests
│       └── gameHelpers.test.js
├── package.json
└── tsconfig.json
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    GameContext (State)                   │
│  - board: 10x10 grid                                   │
│  - pieces: 3 random pieces in tray                     │
│  - score, combo, gameOver state                         │
└──────────────────────┬──────────────────────────────────┘
                       │ useGame()
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   GameScreen                             │
│  - Layout & rendering only                              │
│  - Subscribes to state                                  │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│useDragAndDrop│ │useHaptics  │ │  useSounds  │
│ - PanResponder│ │ - Haptic   │ │ - WAV       │
│ - Animation   │ │   feedback │ │   playback  │
└──────┬──────┘ └─────────────┘ └─────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                    Components                            │
│  GameBoard → Cell[] → BlockPiece                        │
│  TraySlot → BlockPiece                                  │
│  ScoreBoard, ComboIndicator, ParticleEffect             │
└─────────────────────────────────────────────────────────┘
```

## Game Mechanics

### Board

- 10x10 grid (100 cells)
- Each cell can be empty (`null`) or filled with a color
- Cells are cleared when entire row or column is filled

### Pieces

- 35+ unique piece shapes: dots, lines (2-5), squares (2x2, 3x3), L-shapes, T-shapes, S/Z-shapes, corners, plus shapes
- Each piece has a random color from the 8-color palette
- 3 pieces displayed in tray at a time
- New pieces spawn when all 3 are placed

### Placement

- Drag piece from tray to board
- Ghost preview shows valid (green) or invalid (red) placement
- Piece snaps to grid, centered under finger
- Invalid drops bounce back to tray

### Scoring

| Action               | Points  |
| -------------------- | ------- |
| Per block placed     | 10      |
| Single line cleared  | 100     |
| Each additional line | +200    |
| **Combo multiplier** | 1x → 4x |

**Combo System:**

- Consecutive clears increase combo counter (resets on turn with no clears)
- Multipliers: 1x, 1.5x, 2x, 2.5x, 3x, 3.5x, 4x (max)

### Game Over

- Triggered when no remaining piece can fit on board
- Saves stats: games played, best combo, total lines, high score
- Option to play again or return home

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm run test:watch

# Coverage report
pnpm run test:coverage
```

Test coverage targets:

- 70% branches, functions, lines, statements

## Tech Stack

- **Framework:** Expo SDK 54 with React Native 0.81
- **Navigation:** expo-router (file-based routing)
- **Styling:** React Native StyleSheet
- **Animations:** react-native-reanimated, Animated API
- **Gestures:** react-native-gesture-handler, PanResponder
- **Persistence:** @react-native-async-storage/async-storage
- **TypeScript:** Strict mode enabled
- **Testing:** Jest with babel-jest transform
