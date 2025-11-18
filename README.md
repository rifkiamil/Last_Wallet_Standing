# Last Wallet Standing

A visual simulation of wealth distribution mechanics demonstrating how random exchanges lead to inequality (based on statistical mechanics of money).

## 🚀 How to Run Locally

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Update index.html**
    The default `index.html` uses a CDN for quick previewing. For local development and building, modify `index.html`:
    
    *Remove the `<script type="importmap">` block and the Tailwind CDN script.*
    *Add the following line inside the `<body>` tag:*
    ```html
    <script type="module" src="/index.tsx"></script>
    ```
    *(Note: You may need to set up Tailwind CSS locally via PostCSS if you remove the CDN script, or keep the CDN script for simplicity).*

3.  **Start Dev Server**
    ```bash
    npm run dev
    ```

## 🌐 GitHub Pages Deployment

### Automated Deployment

This project uses **GitHub Actions** to automatically build and deploy to GitHub Pages whenever you push to the `main` branch.

**Setup Steps:**
1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push your code to the `main` branch
4. The workflow will automatically build and deploy your site

Your site will be available at: `https://<username>.github.io/<repository-name>/`

### How It Works

The deployment is handled by `.github/workflows/deploy.yml`, which:
1. **Triggers** on every push to `main` (or manually via workflow_dispatch)
2. **Sets up** Node.js 20 with npm caching for faster builds
3. **Installs** dependencies using `npm ci` (requires `package-lock.json`)
4. **Builds** the Vite project using `npm run build` (creates static files in `dist/`)
5. **Uploads** the `dist` folder as a Pages artifact
6. **Deploys** using GitHub's official `actions/deploy-pages@v4` action

### Design Choices

**Why GitHub Actions instead of manual deployment?**
- **Automation**: No need to manually build and push to a `gh-pages` branch
- **Consistency**: Every deployment uses the same build process
- **Simplicity**: One push to `main` triggers everything automatically

**Why `base: './'` in vite.config.ts?**
- GitHub Pages serves from a subdirectory (e.g., `/repository-name/`)
- Relative paths (`./`) ensure assets load correctly regardless of the base URL
- This makes the build portable between different hosting environments

**Why separate build and deploy jobs?**
- **Clarity**: Separates concerns (building vs deploying)
- **Reusability**: Build artifacts can be inspected or used elsewhere
- **Best Practice**: Follows GitHub's recommended Pages deployment pattern

**Why use `npm ci` instead of `npm install`?**
- **Reproducibility**: `npm ci` uses the exact versions from `package-lock.json`
- **Speed**: Faster in CI environments (deletes `node_modules` first, then installs)
- **Reliability**: Fails if `package-lock.json` is out of sync with `package.json`
- **Note**: Requires `package-lock.json` to be committed to the repository

### Manual Deployment (Alternative)

If you prefer manual deployment:
1. Build: `npm run build`
2. Deploy the `dist/` folder to any static hosting service

## 🎮 Game Rules

- **Default**: 100 Agents, $50 start.
- **Bankrupt**: If balance hits 0, agent is eliminated.
- **Debt Mode**: Agents can go into negative balance.
- **Goal**: Observe how wealth concentrates in fewer hands over time (Gini coefficient increases).
