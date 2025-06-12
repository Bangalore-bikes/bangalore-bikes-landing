# [Bangalore Bikes](https://bangalorebikes.com/) Landing Website

This repository serves as the development house for [r/BangaloreBikes](https://www.reddit.com/r/bangalorebikes/) official website. Our goal is to create a comprehensive platform for the biking community in Bengaluru, providing convenient access to:

- **Preferable Ride Locations:** Discover and plan your next biking adventure around the city and beyond.
- **Emergency Contacts:** Quick access to essential emergency contacts within Bengaluru.
- **Communication Etiquette:** Dos and don'ts for effective and respectful communication within the biking community.
- **Ride Safety Information:** Crucial tips and guidelines for safe riding practices.
- **Shipping & Logistics:** Useful information related to motorcycle shipping and logistics.
- **Biking Tips & Features:** A variety of other helpful features and tips for all bikers.

## Technology Stack

This project is built with a modern and robust technology stack:

- **Framework:** [Next.js 15](https://nextjs.org/) - A React framework for building full-stack web applications.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - A superset of JavaScript that adds static typing to enhance code quality and maintainability.
- **Package Manager & Runtime:** [Bun](https://bun.sh/) - A fast, all-in-one JavaScript runtime, bundler, transpiler, and package manager.

We are leveraging the [App Router](https://nextjs.org/docs/app-router) for efficient routing and server components.

## Getting Started

To get the development server up and running on your local machine:

1. **Clone the repository:**

   ```bash
   git clone [https://github.com/Bangalore-bikes/bangalore-bikes-landing.git](https://github.com/Bangalore-bikes/bangalore-bikes-landing.git)
   cd bangalore-bikes-landing
   ```

2. **Install dependencies:**
   Since we are using Bun, you can install all the project dependencies with:

   ```bash
   bun install
   ```

3. **Run the development server:**

   ```bash
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application will hot-reload as you make changes to the code.

## Project Structure & Development

The project follows the standard Next.js App Router structure. Key dependencies and libraries used include:

- **UI Components:** `@radix-ui/react-*` for unstyled, accessible UI primitives.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS, along with `postcss` and `autoprefixer`.
- **Form Management:** `react-hook-form` with `@hookform/resolvers` (likely Zod for schema validation).
- **Date Pickers:** `react-day-picker` and `date-fns`.
- **Charting:** `recharts` for data visualization.
- **Icons:** `lucide-react` for a versatile icon library.
- **Theming:** `next-themes` for dark/light mode support.
- **Carousel:** `embla-carousel-react`.

## Deciding What to Work On

We welcome contributions from the community! To see what's available to work on:

1. Check out the [issues](https://github.com/Bangalore-bikes/bangalore-bikes-landing/issues) tab on GitHub.
2. Pick an issue that hasn't been assigned to anyone.
3. Feel free to comment on the issue to let others know you're working on it, or assign yourself if you have the necessary permissions.

## Deployment

The Bangalore Bikes landing website is currently hosted at [https://bangalorebikes.com/](https://bangalorebikes.com/) and is deployed as a [Netlify](https://www.netlify.com/) project. Continuous deployment is configured to automatically build and deploy changes from the main branch.

---
