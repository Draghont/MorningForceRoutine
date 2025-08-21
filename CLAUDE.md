# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **MorningForceRoutine** - a client-side web application for conducting timed workout routines. It's a morning wellness routine called "Passeggiata della Forza" (Strength Walk) with structured exercise blocks and multi-language support (Italian/English).

## Architecture

### Core Components

- **index.html**: Single-page application entry point with tabbed interface (Exercise/Schedule views)
- **workout-timer.js**: Main application logic with WorkoutTimer class and ConfigurationManager
- **style.css**: Dark-themed CSS with neon accents and responsive design
- **JSON Configuration Files** (dual structure):
  - `workout_exercise_sequence_and_time.json`: Exercise timing, sequence, and setup periods
  - `workout_exercise_text_and_i18n.json`: Internationalization and exercise descriptions

### Key Architecture Patterns

1. **Dual Configuration System**: App attempts to load external JSON files first, falls back to embedded data in JavaScript if files aren't found
2. **Phase-Based Exercise Timing**: Each exercise has setup_s (preparation time) and work_s (actual exercise time)
3. **Block-Based Structure**: Exercises grouped into blocks (activation, warmup_standing, warmup_floor, strength_standing, strength_floor, stretching) with optional rest periods between blocks
4. **Multi-language Support**: Complete i18n system with language switcher

### Data Flow

1. ConfigurationManager loads external JSON or falls back to embedded data
2. WorkoutTimer processes exercises into processedExercises array with calculated timing
3. Timer runs through phases: ready → countdown → exercise (setup → work) → block rest → next exercise → complete

## Development Workflow

### Running the Application
- Open `index.html` directly in a web browser (no build process required)
- Uses native ES6 modules and vanilla JavaScript
- No package.json or build tools needed

### Testing Changes
- Modify JSON files to test different workout configurations
- Use browser developer tools for debugging
- Test both language versions (Italian/English)

### JSON File Structure
See `json_files_explanation.txt` for detailed documentation of the two-file contract and schema requirements.

### Key Classes and Methods

**WorkoutTimer Class**:
- `processExercises()`: Converts timing config into runtime exercise data
- `tick()`: Main timer loop handling phase transitions
- `handlePhaseTransitions()`: Manages setup/work/rest phase logic
- `setLanguage()`: Updates UI language and reprocesses exercises

**ConfigurationManager Class**:
- `loadExternalFiles()`: Attempts to fetch external JSON configuration
- `validateFiles()`: Ensures JSON schema compatibility between timing and i18n files

### Styling System
- CSS custom properties for theming
- Block-specific color coding for exercise types
- Responsive design with mobile-first tab interface
- Neon accent theme with dark background

### State Management
- Single WorkoutTimer instance with centralized state object
- Real-time UI updates via DOM manipulation
- Audio feedback using Web Audio API for beeps and victory tune