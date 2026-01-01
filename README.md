# MycoMap Frontend

Web interface for MycoMap, a mushroom foraging and logging application.  
The frontend provides an interactive map, user authentication, and tools for managing personal finds.

---

## Overview

The MycoMap frontend allows users to:

- Explore public mushroom finds on an interactive map
- Register and log in with secure authentication
- Create, edit, and delete their own finds
- Upload photos and optionally hide sensitive location data
- Browse other users and view their public logs

The application communicates with the MycoMap backend API.

---

## Tech Stack

- React
- React Router
- Context API
- Mapbox GL JS
- Vite
- CSS (Flexbox & Grid)

---

## Application Structure

api/ API helpers and hooks
auth/ Authentication context and pages
components/ Reusable UI components
layout/ Layout and navigation
pages/ Route-based pages
styles/ CSS stylesheets

---

## Mapping & Visualization

- Public finds are displayed using Mapbox GL JS
- Custom markers and popups show species, images, and metadata
- Filters allow narrowing results by species and date
- Popups gracefully handle missing or broken images

---

## Authentication Flow

- Users register and log in through the backend API
- JWTs are stored in session storage
- Auth state is shared across the app using React Context
- Protected actions require an authenticated session

---

## Image Handling

- Find images are uploaded through the backend
- Public images are served via S3 or backend-hosted URLs
- Broken or missing images fall back to a placeholder asset

---

## Environment Configuration

Create a `.env` file with:

VITE*API_URL=http://localhost:3000
VITE_MAPBOX_TOKEN=your_mapbox_token
Only variables prefixed with `VITE*` are exposed to the client.

---

## Running Locally

```bash
npm install
npm run dev
The app will start on the Vite development server (typically http://localhost:5173).

Build & Deployment
bash
Copy code
npm run build
Set VITE_API_URL to the deployed backend URL for production builds.

Accessibility & UX
Semantic HTML and ARIA attributes are used throughout

Keyboard navigation is supported

Loading and error states are surfaced to users

Forms provide validation feedback
```
