# MycoMap — Frontend (FrontendCapstone)

React + Vite frontend for MycoMap: map-based UI to browse, create, and manage mushroom finds. Uses Mapbox for mapping, fetches the backend API, and supports image uploads for finds.

Included screenshots

- `public/MycoHome.png` — Home / Map view
- `public/MyFinds.png` — My Finds (user) page
- `public/CreateFind.png` — Create Find page

You can place the screenshots in `FrontendCapstone/public/` and they will render on GitHub and in the project docs. Example:

```markdown
![Home screenshot](./public/MycoHome.png)
![My Finds screenshot](./public/MyFinds.png)
![Create Find screenshot](./public/CreateFind.png)
```

## Quick demo features

- Map view of public finds (Mapbox)
- Marker popups show a thumbnail image, species and metadata
- Create/Edit finds with photo upload
- User authentication (login/register)
- Graceful fallback for broken images (sadmushroom placeholder)

## Prerequisites

- Node.js (>= 18 recommended)
- npm
- A running backend API (see `BackendCapstone/`) or set `VITE_API_URL` to the deployed backend
- Mapbox token (`VITE_MAPBOX_TOKEN`) for the map

## Environment

Create a `.env` file at the project root (`FrontendCapstone/.env`) with:

```
VITE_API_URL=http://localhost:3000
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

Note: Vite exposes only variables prefixed with `VITE_` to the client.

## Install and run

From `FrontendCapstone/`:

```bash
npm install
npm run dev      # starts Vite dev server
# npm run build  # build for production
```

Open the dev server (usually `http://localhost:5173/`). The app expects the backend API (auth, finds endpoints) to be reachable via `VITE_API_URL`.

## Image fallback behavior

- The UI includes `onError` fallbacks for find images and the Mapbox popup image. When an image fails to load the app replaces it with `/svgs/sadmushroom.png` (already present in `public/svgs/`).
- If you'd prefer to use different placeholder artwork, drop your image in `public/` (for example `public/imgunavailable.png`) and update the fallback src in the source (two pages and the Mapbox popup):

  - `src/pages/MyFinds.jsx`
  - `src/pages/UserPublicFinds.jsx`
  - `src/pages/Welcome.jsx` (popup HTML)

## Mapbox & popups

- The map is in `src/pages/Welcome.jsx`. Markers are created with custom DOM elements and popups are generated with `setHTML()`; inline `onerror` attributes are used in popup HTML to handle image fallback.

## Build & deploy notes

- For production deploy, set `VITE_API_URL` to your deployed backend URL and `VITE_MAPBOX_TOKEN` to a production Mapbox token.
- If the backend uses S3 for images, ensure `S3_PUBLIC_BASE` is set on the backend so image URLs include the full host.

## Troubleshooting

- If images show as broken while the bucket contains objects, verify `S3_PUBLIC_BASE` is configured on the backend and that `image_url` in the `finds` record points to the expected S3 URL.
- To check CORS issues with images served from S3, run a curl HEAD with an `Origin` header, e.g.:

  ```bash
  curl -I -H "Origin: http://localhost:5173" "https://mycomap-uploads.s3.us-east-2.amazonaws.com/your-object-key"
  ```

## Contributing

Pull requests welcome. Keep front-end changes small and add tests where appropriate.

---

Created for the Frontend Capstone project.

**[Frontend Repository](https://github.com/MajerAsh/FrontendCapstone)**

MycoMap FrontendCapstone

This is the frontend repository for MycoMap, a full-stack mushroom foraging platform built with React. Users can register, log in, log mushroom finds, and explore foraged mushrooms on an interactive world map.
The backend API lives in the BackendCapstone repository.

------- Features:

- Public map of mushroom finds using Mapbox GL JS.

- Filters for species and geographic region.

- Authenticated users can:
  Register / Log in with JWT.
  Create mushroom finds with image and location.
  Edit or delete their finds.
  Search for foragers and view their public logs.

-------Technologies:

-React (v19)

-React Router

-Context API

-Mapbox GL JS

-Vite (development server & bundler)

-CSS (Flexbox & Grid)
