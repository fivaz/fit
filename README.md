## 🚀 Getting Started: Customizing Your App

To transform this boilerplate into your specific application, replace all occurrences of the placeholder text **"boilerplate"** (case-sensitive) or **"boilerplate"** with your actual project name (e.g., "MyAwesomeApp").

You can perform a **Global Search and Replace** in your editor (usually `Cmd+Shift+F` or `Ctrl+Shift+F` in VS Code).

---

### 📂 Files to Update

| File             | Context                                                      | Meaning/Purpose                                                                                                  |
| :--------------- | :----------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `package.json`   | `"name": "boilerplate"`                                      | Defines the official project name for the Node.js environment and package manager.                               |
| `app/layout.tsx` | `APP_DEFAULT_TITLE`, `APP_TITLE_TEMPLATE`, `APP_DESCRIPTION` | Sets the HTML metadata and the name that appears in browser tabs.                                                |
| `manifest.json`  | `name`, `short_name`                                         | Configures the Progressive Web App (PWA) name for mobile and desktop installation.                               |
| `next.config.ts` | `project: "boilerplate"`                                     | Links the application to your specific **Sentry project** for error tracking and performance monitoring.         |
| `consts.ts`      | `APP_NAME`                                                   | The single source of truth for the app name; used by `login-form.tsx`, `register-form.tsx` and `app/layout.tsx`. |

---

### 🔑 Environment Setup

Before running the application, you need to initialize your environment variables and your database:

1.  **Create your .env file:** Copy the example template to create your local environment file:
    ```bash
    cp .env.example .env
    ```
2.  **Configure Variables:** Open the newly created `.env` file and update the variables. Specifically, ensure the `DATABASE_URL` points to a unique database name to keep your data isolated from other projects.

3.  **Initialize the Database:** Once your `.env` is configured, run the following command to apply migrations and seed the initial data. This is required to create the necessary tables for **better-auth**:

    ```bash
    pnpm run db:reset
    ```

4.  **Test Credentials:** The `seed.ts` file automatically generates a default user for development. You can log in with:
    - **Email:** `test@test.com`
    - **Password:** `test@test.com`

---

### 🎨 Customizing Icons & Branding

This boilerplate uses a PWA asset generator to handle icons for all platforms automatically.

1.  **Replace the Base Icon:** Replace `public/favicon.svg` with your own logo/icon (keep the same filename).
2.  **Generate Assets:** Run the following command to automatically generate the `favicon.ico`, Apple touch icons, and all PWA-compliant sizes defined in your `manifest.json`:

```bash
pnpm run generate-pwa-assets
```

---

### 💻 Available Scripts

| Command                        | Description                                                                         |
| :----------------------------- | :---------------------------------------------------------------------------------- |
| `pnpm run dev`                 | 'Starts the Next.js development server.'                                            |
| `pnpm run build`               | 'Compiles the application for production.'                                          |
| `pnpm run start`               | 'Starts the production server (run build first).'                                   |
| `pnpm run lint`                | 'Runs ESLint to find code quality issues.'                                          |
| `pnpm run format`              | 'Cleans up code using Prettier and fixes ESLint errors (including unused imports).' |
| `pnpm run tsc`                 | 'Runs the TypeScript compiler in watch mode to catch type errors.'                  |
| `pnpm run db:setup`            | 'Hard resets the database, runs seeds, and prepares migrations.'                    |
| `pnpm run db:reset`            | 'Resets the database to a clean state and runs seed data.'                          |
| `pnpm run db:seed`             | 'Populates the database with initial/dummy data.'                                   |
| `pnpm run db:generate`         | 'Generates the Prisma Client based on your schema.'                                 |
| `pnpm run generate-pwa-assets` | 'Generates all necessary PWA icons from your favicon.svg.'                          |
| `pnpm run release:test`        | 'Runs GitHub Actions locally using act.'                                            |
| `pnpm run release:prune-cache` | 'Clears the local cache used by act.'                                               |

---

### ⚡ Optimistic UI Hook Factory

The boilerplate includes a powerful factory in `hooks/use-entity-mutations.ts`. Its purpose is to allow you to mutate entities **optimistically** (updating the UI instantly) while running server actions in the background to persist changes in the DB, with automatic rollbacks on error.

#### 1. Create your Entity Store

To manage a specific entity (e.g., `Task`), create a file like `hooks/task-store.ts`:

```typescript
import { createEntityStore } from "@/hooks/optimistic/create-entity-store";
import { createEntityMutations } from "@/hooks/optimistic/use-entity-mutations";
import { Task } from "@/lib/generated/prisma/client";

export const [TasksProvider, useTasksStore] = createEntityStore<Task>();
export const useTaskMutations = createEntityMutations(useTasksStore);
```

#### 2. Usage in Components

Wrap your parent component in the TasksProvider. In child components, you can access the state and mutations:

```tsx
<TasksProvider initialItems={dataFromDatabase}>
	<TaskList />
</TasksProvider>
```

##### Read state in `<TaskList />` or any of its children:

```typescript
const { items: tasks } = useTasksStore();
// or const { items: tasks } = useTaskMutations();
```

##### Perform mutations:

```tsx
const { updateItem, isPending } = useTaskMutations();

const handleRename = (task: Task) => {
	updateItem(
		{ ...task, name: "New Name" },
		{
			// 1. The background work (Server Action)
			persist: () => renameTaskAction(task.id, "New Name"),

			// 2. Feedback
			onSuccess: () => toast.success("Saved"),
			onError: () => toast.error("Connection lost. Reverting changes..."),
		},
	);
};

return (
	<button onClick={handleRename} disabled={isPending}>
		{isPending ? "Saving..." : "Rename Task"}
	</button>
);
```

---

### 💡 Refactoring Tip (Optional)

If you find that your IDE automatically deletes imports while you are still moving code around, you can temporarily disable this behavior at the IDE level.

Add the following flag to your IDE's ESLint "run on save" configuration: --rule 'unused-imports/no-unused-imports: off'

This allows you to keep unused imports during active refactoring. To perform a final cleanup and remove all unused imports across the project, simply run:

```bash
pnpm run format
```
