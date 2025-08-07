# Frontend Template

You can use this repository as a template for your frontend. It provides a very simple
React Router layout with a navbar, an `AuthContext` with login and register pages, and an
`ApiContext` with two custom hooks: `useQuery` and `useMutation`.

## Usage

1. Change the name of the package in `package.json`. - ✔️
2. Update the environment variables in `example.env` and rename the file to `.env`. -✔️
3. Build components and add routes to them in `App.jsx`. -TODO

**[Frontend Repository](https://github.com/MajerAsh/FrontendCapstone)**

This is the frontend repository for **MycoMap**, a full-stack mushroom foraging app where users can log, explore, and discover mushroom finds on an interactive world map.

## Overview

**MycoMap** is a React-based web app that allows users to:

- Log mushroom finds with descriptions, dates, and photos
- View their finds on a private map
- Explore the public map of worldwide finds
- Search by species or location
- Discover other foragers and their logs

---

## Core Features (MVP)

- Public map of mushroom finds
- Filter pins by species, city, state, country
- Register & log in users
- Create new mushroom finds with image
- View/edit/delete personal logs
- Search for other foragers and explore their finds

---

## Tech Stack

- **React**
- **React Router**
- **Mapbox GL JS**
- **Context API** (for auth)
- **CSS Flexbox + Grid**
- **Vite** (build tool)
- **Axios / Fetch API**

---

## Folder Structure

```bash
frontendCapstone/
├── public/                # Static assets (favicon, images)
├── src/
│   ├── components/        # Navbar, Map, Filters, Cards
│   ├── context/           # Auth and user context
│   ├── pages/             # Route-based views
│   ├── hooks/             # Custom hooks (e.g. useFinds)
│   ├── App.jsx            # App routing
│   └── main.jsx           # React root
├── .env                   # Frontend API base URL
├── index.html
└── package.json
```
