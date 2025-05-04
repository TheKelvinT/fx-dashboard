# FX Dashboard

## Overview

FX Dashboard is a modern Angular-based currency exchange dashboard that provides
real-time forex rates, historical trends, and currency conversion capabilities.
Built with scalability and performance in mind, it demonstrates best practices
in Angular architecture, state management, and testing strategies.

## Core Features

- Real-time currency exchange rate monitoring
- Interactive historical rate charts with customizable timeframes
- Multi-currency comparison (up to 3 currencies simultaneously)
- Currency conversion calculator
- Basic error handling and retry mechanisms

## Current Implementation Status

### Completed Features

- Base currency selection and conversion
- Historical rate visualization
- Multi-currency comparison (max 3 currencies)
- Real-time rate updates
- Basic error handling

### In Progress / Partially Implemented

- **Offline Support**:

  - Current: Basic error handling for network issues
  - Planned: Full offline mode with cached rates and ServiceWorker
    implementation
  - Timeline: Scheduled for next iteration

- **Test Coverage**:
  - Current Coverage:
    ```
    E2E: Core user flows for exchange table
    Unit: Basic component testing
    ```
  - Target Coverage (Next Phase):
    ```
    Statement coverage: 80%
    Branch coverage: 75%
    Function coverage: 80%
    Line coverage: 80%
    ```

## Technical Stack

- **Framework**: Angular 19.2.9
- **UI Components**: NG-Zorro for enterprise-grade UI components
- **Charts**: Chart.js for performant data visualization
- **API Integration**: Frankfurter API for forex data
- **Testing**: Cypress (E2E), Jasmine (Unit), Angular Testing Library
- **Build Tools**: Angular CLI, Webpack
- **Style**: SCSS with BEM methodology

## Project Structure

The application follows a feature-based architecture with clear separation of
concerns:

```
src/
├── app/
│   ├── core/                # Core functionality used across the app
│   │   ├── interceptors/    # HTTP Interceptors
│   │   └── services/        # Core services (forex, offline, etc.)
│   ├── features/            # Feature modules
│   │   └── dashboard/       # Dashboard feature module
│   │       ├── components/  # Dashboard-specific components
│   │       └── services/    # Dashboard-specific services
│   ├── models/              # Data models and interfaces
│   │   └── currency.model.ts
│   └── shared/              # Shared modules, components, and utilities
│       ├── components/      # Shared components (layout, etc.)
│       ├── test-utils/      # Testing utilities
│       └── utils/           # Utility functions
```

## Architecture Decisions

### Current Architecture

1. **Features**:

   - Each feature is encapsulated in its own module
   - Feature-specific components are contained within the feature
   - Clear API boundaries between features

2. **Components**:

   - Standalone components with clear responsibilities
   - Historical chart for data visualization
   - Exchange rates table for currency selection
   - Currency converter for rate calculations

3. **Services**:

   - `ForexService` in the core module for API communication
   - `OfflineForexService` for offline capability
   - Feature-specific services in feature modules

4. **Models**:

   - Strong TypeScript typing
   - Clear interface definitions
   - Shared currency models

5. **Core**:
   - Essential services used across the application
   - HTTP interceptors
   - Global error handling

### Design Patterns & Best Practices

- **Feature Module Pattern**: Organizing code by feature for better
  maintainability
- **Container/Presenter Pattern**: Clear separation of smart and presentational
  components
- **Facade Pattern**: Service facades for encapsulating complex business logic
- **Repository Pattern**: Data access layer abstraction
- **SOLID Principles**: Emphasis on single responsibility and dependency
  injection
- **Reactive Forms**: For complex form handling with validation
- **Change Detection Strategy**: OnPush for optimal performance

## Testing Strategy

### Current Testing Implementation

- **E2E Tests** (Cypress):

  - Exchange table core functionality
  - Currency selection flows
  - Basic error scenarios

- **Unit Tests**:
  - Core component initialization
  - Basic service functionality

### Planned Testing Improvements

1. **Coverage Expansion**:

   - Additional E2E scenarios for edge cases
   - Comprehensive unit tests for services
   - Integration tests for API interactions
   - State management testing

2. **Test Infrastructure**:
   - Automated coverage reporting
   - CI/CD pipeline integration
   - Performance testing implementation

## Setup & Development

### Prerequisites

- Node.js (v18+)
- Angular CLI (v19.2.9)
- npm or yarn

### Installation

```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts

- `npm start`: Development server (http://localhost:4200)
- `npm run build`: Production build
- `npm run test`: Unit tests with coverage
- `npm run e2e`: End-to-end tests
- `npm run lint`: ESLint code analysis
- `npm run format`: Prettier code formatting

## Performance Optimization

- Lazy loading of feature modules
- Virtual scrolling for large data sets
- OnPush change detection strategy
- Service worker for offline support
- Asset optimization and lazy image loading

## Error Handling

- Global error boundary implementation
- Retry mechanism for failed API calls
- Graceful degradation strategy
- Comprehensive error logging
- User-friendly error messages

## Future Improvements

### High Priority (Next Sprint)

1. **Offline Capability Enhancement**:

   - Implementation of ServiceWorker
   - Local storage for recent exchange rates
   - Offline mode indicator
   - Sync mechanism for when connection returns

2. **Test Coverage Expansion**:
   - Component test coverage increase
   - Integration test suite implementation
   - E2E test scenarios expansion
   - Automated coverage reporting

### Medium Priority

- WebSocket integration for real-time updates
- Progressive Web App (PWA) implementation
- Accessibility improvements (WCAG 2.1)

### Long Term

- Performance monitoring integration
- Internationalization support
- Advanced caching strategies
- Real-time market alerts

## Known Limitations

1. **Offline Mode**:

   - Currently limited to basic error handling
   - No data persistence between sessions
   - Manual refresh required when connection returns

2. **Testing**:
   - Coverage focused on critical paths
   - Limited edge case testing
   - Manual performance testing only

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process
for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for
details

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment to
Vercel:

### Pipeline Steps

1. **Lint**: Validates code quality using ESLint
2. **Format Check**: Verifies code formatting with Prettier
3. **Tests**: Runs unit tests with Angular Test Bed
4. **E2E Tests**: Executes Cypress end-to-end tests
5. **Build**: Compiles the application for production
6. **Deploy**: Deploys to Vercel staging environment

### Setup Requirements

To enable the CI/CD pipeline with Vercel deployment, you need to add the
following secrets to your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `VERCEL_ORG_ID`: Your Vercel organization ID

You can get these values by running:

```
vercel login
vercel link
```

The CI pipeline runs on every push to the main branch and on pull requests to
ensure code quality.
