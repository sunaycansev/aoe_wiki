# Age of Empires Wiki

A web application to browse, filter, and view details about units from Age of Empires II, built using modern front-end technologies.

## 🚀 Live Demo

Check out the live demo: [AoE Wiki](https://aoe-wiki-n2uc44gkn-sunaycansevs-projects.vercel.app)

## 📸 Screenshot

## ![AoE Wiki Screenshot](/public/assets/ss1.png)

## ![AoE Wiki Screenshot](/public/assets/ss2.png)

## ![AoE Wiki Screenshot](/public/assets/ss3.png)

## ✨ Features

- **Homepage**: A welcoming landing page with game overview and navigation.
- **Units Page**:
  - Displays a filterable and sortable table of Age of Empires II units.
  - **Filtering**: Filter units by Age (Dark, Feudal, Castle, Imperial) and Resource Costs (Food, Wood, Gold) using interactive controls.
  - **Sorting**: Clickable table headers to sort units by ID, Name, Age, or Cost.
  - **Search**: Real-time client-side search functionality by unit name.
  - **Pagination**: Efficiently browse through the list of units with customizable page size.
  - **URL Synchronization**: Filter, sort, and pagination states are reflected in the URL parameters for shareable links and browser history navigation.
- **Unit Detail Page**: View comprehensive details for a selected unit.
- **Background Music**: Integrated background audio player with play/pause, mute, and volume controls for an better experience.
- **Responsive Design**: Fully adaptive interface that works seamlessly on desktop, tablet, and mobile devices.
- **Performance Optimized**: Fast loading times and smooth interactions.

## 🛠️ Technologies Used

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit with Redux-Saga for asynchronous actions
- **Routing**: React Router v7 with route-based code splitting
- **Table**: TanStack Table v8 for powerful, headless table functionality
- **UI Components**: Radix UI (Slider, Checkbox, Label, Toggle Group) for accessible UI primitives
- **Styling**: SCSS Modules for component-scoped styling
- **Testing**: Vitest and React Testing Library for unit and integration tests
- **Linting**: ESLint with custom configuration for code quality

## 🚀 Setup and Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sunaycansev/aoe_wiki.git
   cd aoe-codex
   ```

2. **Install dependencies:**

   ```bash
   yarn install
   # or
   npm install
   ```

3. **Start the development server:**

   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. **Open in browser:**
   The application will be available at [http://localhost:5173](http://localhost:5173)

## 📝 Available Scripts

- **`yarn dev`**: Runs the app in development mode

- **`yarn build`**: Builds the app for production to the `dist` folder.

- **`yarn lint`**: Lints the project files using ESLint.

- **`yarn preview`**: Serves the production build locally for previewing.

- **`yarn test`**: Runs the unit and integration tests using Vitest in watch mode.

- **`yarn test:ui`**: Runs tests with the Vitest UI for a graphical interface.

- **`yarn coverage`**: Runs tests once and generates a code coverage report.

## 📁 Project Structure

```
/src
|-- assets          # Static assets like images, audio files
|-- components      # Shared reusable components (Navigation, Icons, Spinner)
|-- constants       # Application-wide constants (AGES, COST_TYPES)
|-- data            # Static data files (e.g., age-of-empires-units.json)
|-- features        # Components related to specific features
|-- hooks           # Custom React hooks (useDebounce, useScrollToTop)
|-- layouts         # Layout components (MainLayout)
|-- routes          # Page-level components
|-- store           # Redux store configuration, slices, and sagas
|   |-- sagas
|   |-- slices
|   `-- store.ts
|-- styles          # Global styles, variables, mixins
|-- types           # TypeScript type definitions
|-- App.tsx         # Main application component with routing setup
|-- main.tsx        # Application entry point
```

## 🧪 Testing

The project includes a comprehensive test suite using Vitest and React Testing Library. To run tests:

```bash
yarn test
```

For a visual test interface:

```bash
yarn test:ui
```

## Code Coverage Report

![Cove Coverage Report](/public/assets/coverage.png)

## 📱 Responsive Design

The application is fully responsive and works well on:

- Desktop (1200px and above)
- Tablet (768px to 1199px)
- Mobile (320px to 767px)
