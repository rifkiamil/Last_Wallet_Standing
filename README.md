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

## 🌐 How to Deploy to GitHub Pages

1.  **Build the Project**
    ```bash
    npm run build
    ```
    This will create a `dist` folder with static files.

2.  **Deploy**
    - Push the contents of the `dist` folder to a `gh-pages` branch on your GitHub repository.
    - Or, configure your repository Settings > Pages to serve from the `root` of the `gh-pages` branch.

## 🎮 Game Rules

- **Default**: 100 Agents, $50 start.
- **Bankrupt**: If balance hits 0, agent is eliminated.
- **Debt Mode**: Agents can go into negative balance.
- **Goal**: Observe how wealth concentrates in fewer hands over time (Gini coefficient increases).
