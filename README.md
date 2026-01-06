# Cloud Resume & Portfolio ☁️

A modern, high-performance cloud resume and portfolio website built with [Astro](https://astro.build) and [Svelte](https://svelte.dev), using the [Fuwari](https://github.com/saicaca/fuwari) theme.

This project showcases professional skills, experience, and certifications in a responsive, aesthetically pleasing interface with dynamic features like a live visitor counter.

![Home Page](/public/assets/images/hero-bg.png)

## ✨ Key Features

- **Custom Landing Page**: Features a "Monet-style" artistic hero section with a welcome message and featured activity.
- **Dedicated Profile Sections**:
  - **Skills (`/skills/`)**: A dedicated page displaying technical skills and a 2-column grid of official certification logos (Azure, Kubernetes) with verification links.
  - **Experience (`/experience/`)**: A clean timeline of professional history.
  - **Projects (`/archive/`)**: A portfolio section to showcase projects (formerly "Archive").
- **Dynamic Visitor Counter**: Integrated Azure Function API to track and display live site visits in the navigation bar.
- **Modern UI/UX**:
  - Clean "Blue" theme (Hue 260).
  - Dark/Light mode support.
  - Responsive design for mobile and desktop.
  - Interactive hover effects and smooth transitions.

## 🛠️ Architecture

- **Frontend**: Astro (Static Site Generation with Islands Architecture for interactivity).
- **Styling**: Tailwind CSS + Stylus.
- **Interactivity**: Svelte components (Visitor Counter, Theme Switcher).
- **Backend**: Azure Functions (HTTP Trigger) + Azure Cosmos DB/Table Storage (for visitor counting).
- **Content**: Markdown-based content management for blog posts and portfolio items.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (v9+)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/cloud-resume.git
    cd cloud-resume
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Start the development server:
    ```bash
    pnpm dev
    ```

The site will be available at `samueladebodun.com`.

## ⚙️ Configuration

### Site Config
Main configuration is located in `src/config.ts`:
- **Site Title & Subtitle**: "Samuel T. Adebodun - Cloud & DevOps Engineer"
- **Navigation Links**: Customize the navbar menu.
- **Social Links**: Update GitHub, LinkedIn, and Mail links.
- **Theme Color**: Adjust `themeColor.hue` (current: 260).

### Visitor Counter Setup (Azure Integration)

The "Visitors" counter in the navbar is powered by two Azure Functions (`GetVisitorCount` and `SetVisitorCount`) and a Cosmos DB database. These resources are automatically provisioned when deploying the infrastructure using the Bicep templates in this repository.

The `SetVisitorCount` function is responsible for incrementing the visitor count and returning the updated value. The `GetVisitorCount` function is used to retrieve the current count without incrementing it.

To connect the frontend to the API, you need to set the `PUBLIC_VISITOR_API_URL` environment variable to the URL of the `SetVisitorCount` function.

1.  **Environment Variable**:
    - Create a `.env` file in the root directory:
      ```bash
      PUBLIC_VISITOR_API_URL=https://<your-function-app-name>.azurewebsites.net/api/SetVisitorCount
      ```

2.  **Deployment**:
    - If deploying via GitHub Actions to Azure Static Web Apps, add `PUBLIC_VISITOR_API_URL` as a repository secret.

### Infrastructure Deployment

The project includes Infrastructure as Code (IaC) using Bicep and Ansible to provision Azure resources (Storage Account).

1.  **Install Python Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Install Ansible Galaxy Collection**:
    ```bash
    ansible-galaxy collection install azure.azcollection
    ```

3.  **Run Deployment Script**:
    ```bash
    ./bin/deploy
    ```
    This script will compile the Bicep template and deploy the Storage Account to the configured Azure resource group.

## 📂 Project Structure

```
/
├── public/             # Static assets (images, fonts)
├── src/
│   ├── components/     # Astro and Svelte components (Navbar, Hero, VisitorCounter)
│   ├── content/        # Markdown content (posts, spec/skills, spec/experience)
│   ├── layouts/        # Page layouts (MainGridLayout)
│   ├── pages/          # Route definitions (index, skills, experience, posts)
│   ├── types/          # TypeScript definitions
│   └── config.ts       # Main site configuration
├── astro.config.mjs    # Astro configuration
└── tailwind.config.cjs # Tailwind configuration
```

## 📄 License

This project is licensed under the [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license.
