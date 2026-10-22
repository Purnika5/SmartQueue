# Contributing to SmartQueue

Thank you for your interest in contributing to **SmartQueue – Smart Queue Management System**! 

Whether you are fixing a bug, adding new queue dispatching algorithms, enhancing the public display board, or improving documentation, this guide will help you get started quickly.

---

## 1. Development Prerequisites

Before contributing, ensure your development workstation has:
- **Operating System:** Windows 10/11, macOS, or modern Linux.
- **Java Development Kit (JDK):** Version 21 or higher (OpenJDK or Oracle JDK; tested on Java 24).
- **Node.js:** v18.0.0 or higher (v22+ recommended; includes `npm`).
- **Database:** PostgreSQL 15+ (tested on PostgreSQL 18, default port `5433` or `5432`).
- **Git:** Version 2.30+.
- **IDE:** Visual Studio Code, IntelliJ IDEA, or Eclipse.

---

## 2. Local Setup Guide (Windows / PowerShell)

### Step 1: Fork & Clone the Repository
```powershell
# Clone your fork
git clone https://github.com/<your-username>/SmartQueue.git

# Navigate into the project folder
cd SmartQueue
```

### Step 2: Configure the Database
1. Create a PostgreSQL database named `smart_queue`.
2. Review `backend/src/main/resources/application.properties` and configure your local credentials:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5433/smart_queue
   spring.datasource.username=postgres
   spring.datasource.password=<your-local-password>
   ```
   > ⚠️ **SECURITY WARNING:** Never commit your actual database password or API keys to Git! Use environment variables or local property overrides where possible.

### Step 3: Run the Backend
From the project root in PowerShell:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
The backend will build and start listening on `http://localhost:8080`.

### Step 4: Run the Frontend
Open a second PowerShell terminal:
```powershell
cd frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

---

## 3. Branching & Workflow Strategy

We adhere to standard GitHub Flow:

1. **Keep `main` Clean**: Never commit directly to the `main` branch.
2. **Create a Topic Branch**: Branch off `main` with a descriptive name:
   ```powershell
   git checkout -b feature/websocket-notifications
   # or
   git checkout -b fix/pessimistic-lock-timeout
   # or
   git checkout -b docs/add-postman-collection
   ```

### Branch Naming Conventions
- `feature/<name>`: For new features or UI capabilities.
- `fix/<issue-name>`: For bug fixes.
- `docs/<description>`: For documentation additions or corrections.
- `refactor/<module>`: For code refactoring without behavior change.
- `test/<scope>`: For adding unit or integration tests.

---

## 4. Coding Standards

### Backend (Java / Spring Boot)
- **Architecture Integrity**: Adhere strictly to the layered architecture:
  - Controllers only handle HTTP parsing, DTO binding, and response mapping.
  - Business logic resides strictly in Services.
  - Database access is handled exclusively by Repositories.
  - Entities represent database tables; network boundaries must use DTOs.
- **Transactions & Concurrency**: Annotate mutating methods with `@Transactional`. When querying state that could result in race conditions (such as claiming tickets), use appropriate pessimistic or optimistic locks.
- **Exception Handling**: Avoid generic `catch (Exception e)`. Return structured error responses or propagate descriptive exceptions.
- **Secrets Management**: Never hardcode credentials. Use Spring's `@Value("${property.name:}")` or environment variables.

### Frontend (React / TypeScript / Vite)
- **TypeScript First**: Avoid using `any`. Define strong interfaces in `src/types.ts`.
- **Styling**: Maintain the sleek glassmorphic theme using CSS variables defined in `src/index.css`.
- **Accessibility & UX**: Ensure interactive elements have accessible labels, high-contrast text, and responsive breakpoints.
- **Linting**: Run `npm run lint` before committing to catch formatting and syntax errors.

---

## 5. Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]
```

### Commit Types
- `feat`: A new feature (e.g. `feat(display): add fullscreen toggle to kiosk board`).
- `fix`: A bug fix (e.g. `fix(ticket): prevent duplicate sequence prefix generation`).
- `docs`: Documentation updates only (e.g. `docs(api): document ticket status endpoint`).
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `test`: Adding missing tests or refactoring test cases.
- `chore`: Updating dependencies, build scripts, or configuration.

---

## 6. Pull Request (PR) Submission Guidelines

1. **Sync with Main**: Rebase your branch onto the latest `main` branch before opening a PR:
   ```powershell
   git checkout main
   git pull origin main
   git checkout feature/your-feature
   git rebase main
   ```
2. **Verify Builds Locally**:
   - Backend: Run `.\mvnw.cmd test` or `.\mvnw.cmd compile`.
   - Frontend: Run `npm run build` to ensure TypeScript compilation passes without errors.
3. **Open a Pull Request**:
   - Provide a clear title following Conventional Commits.
   - Describe what problem the PR solves and the changes introduced.
   - Include screenshots or GIFs if any frontend changes are made.
   - Check the PR diff to ensure no `.env`, local configuration, or IDE files (`.idea`, `.vscode`) are included.

Thank you for helping make **SmartQueue** better for everyone!
