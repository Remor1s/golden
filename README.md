TG Mini-Shop (простая версия)

Запуск серверной части:

1) Перейти в папку `server`
2) Скопировать `.env.example.txt` в `.env` и заполнить при необходимости
3) Установить зависимости и запустить:

```bash
cd server
npm install
npm run dev
```

Эндпоинты:
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/cart` (заголовок `x-user-id` для изоляции)
- `POST /api/cart` { productId, qty }
- `DELETE /api/cart/:productId`
- `POST /api/orders`

Далее будет добавлен фронтенд (Vite React, JS) c карточками 4:5 и плейсхолдерами изображений «как у Золотого Яблока».


## Deployment

This project consists of two parts: a client (frontend) and a server (backend).

### Frontend (Client)

The frontend is a React application built with Vite. It can be deployed as a static site to GitHub Pages.

1.  **Push to GitHub:** Push your code to a GitHub repository.
2.  **Automatic Deployment:** A GitHub Actions workflow is included (`.github/workflows/deploy-pages.yml`) that will automatically build and deploy the client to GitHub Pages when you push to the `main` or `master` branch.
3.  **Configure API URL:** The deployed client needs to know the URL of your deployed backend.
    *   Go to your GitHub repository's `Settings` > `Secrets and variables` > `Actions`.
    *   Click `New repository secret`.
    *   Create a secret named `VITE_API_URL` and set its value to the URL of your deployed server (e.g., `https://your-server-app.onrender.com`).
4.  **Enable GitHub Pages:**
    *   In your repository settings, go to the `Pages` section.
    *   For the `Source`, select `Deploy from a branch`.
    *   Then switch the source to `GitHub Actions`.

After the workflow runs successfully, your site will be available at `https://<your-username>.github.io/<your-repo-name>/`.

### Backend (Server)

The backend is a Node.js Express server. It cannot be hosted on GitHub Pages and needs to be deployed to a service that supports Node.js applications, such as Render, Heroku, or Vercel.

Here are instructions for deploying to **Render** (which has a free tier):

1.  **Create a new Web Service** on Render and connect your GitHub repository.
2.  **Configuration:**
    *   **Root Directory:** `server`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
    *   **Environment:** Select `Node`.
    *   A `render.yaml` file is included in the root of the project to simplify this setup. Render might detect it automatically.
3.  **Add Environment Variables:**
    *   You can add environment variables if needed (e.g., `PORT`, `ORIGIN` for CORS). For this project, the defaults should work.
4.  **Deploy:** Click `Create Web Service`. Render will build and deploy your server.
5.  **Get the URL:** Once deployed, Render will provide you with a public URL for your server (e.g., `https://your-app-name.onrender.com`). Use this URL for the `VITE_API_URL` secret in your GitHub repository for the frontend.


