# 🌱 Planter — a PlantIn-inspired plant care app (Next.js clone)

A full-stack **plant identification & care web app** built with **Next.js 14 (App Router), TypeScript, MongoDB and NextAuth**. It's a learning clone of the [PlantIn](https://myplantin.com) website. I rebuilt its UI and wrote the backend, auth and database layer myself.

> **Disclaimer:** This is an unofficial educational project and is not affiliated with PlantIn. The PlantIn name, logo, images and marketing copy belong to their owners and are **not** covered by this repo's license. Images are loaded from PlantIn's public CDN for demo purposes only.

**Live demo:** https://planterapp.netlify.app

## ✨ Features

- 🔐 **Authentication**: email/password (bcrypt + JWT) plus OAuth via Google, GitHub, Facebook and Apple with NextAuth and a MongoDB adapter
- 🔑 **Password reset by email** with Nodemailer
- 🌿 **Plant catalogue**: browse, search and view plant details, with related plants
- 🩺 **Plant problems / diseases** pages organised by category
- 💾 **My Plants**: save and unsave plants to your own collection
- 🖼 **Image uploads** to Cloudinary
- ⚙️ **User settings**: change name, email, password and notifications
- 📰 Blog/articles, FAQ and static pages, plus SEO metadata, structured data and a sitemap
- 🧠 Global state with Redux Toolkit, data fetching with SWR, validation with Zod
- 📱 Responsive UI with Tailwind CSS

## 🧱 Tech stack

| Layer | Tools |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Redux Toolkit, SWR |
| Backend | Next.js Route Handlers (`src/app/api`), Mongoose, Zod |
| Auth | NextAuth (credentials + OAuth), bcrypt, JWT |
| Services | MongoDB Atlas, Cloudinary, Nodemailer (Gmail SMTP) |

## 🚀 Getting started

```bash
git clone https://github.com/Mehboobiqbal-dev/Planter.git
cd Planter
npm install
cp .env.example .env.local   # then fill in your own values
npm run dev
```

Open http://localhost:3000.

### Environment variables

See [`.env.example`](.env.example). At minimum you need `MONGODB_URI`, `NEXTAUTH_SECRET`, `JWT_SECRET` and `NEXT_PUBLIC_APP_URL`. Cloudinary, Gmail and the OAuth providers are optional; those features stay off until you configure them.

> Never commit real credentials. `.env*` files are git-ignored.

## 📁 Project structure

```
src/app/
  api/            REST route handlers (auth, plants, problems, user, upload…)
  components/     UI components
  plants/[id]     plant detail pages
  problems/       plant problem pages
  my-plants/      saved plants
  redux/          store & slices
  models/         Mongoose models
lib/              MongoDB & Cloudinary clients
```

## 🤝 Contributing

Issues and pull requests are welcome! Ideas:
- Replace the PlantIn-hosted images with open-license assets
- Add tests
- Add a real plant identification model or API

## 📄 License

The source code I wrote is released under the [MIT License](LICENSE). Third-party brand assets, images and copy are excluded (see the disclaimer above).

---

Made by [Mehboob Iqbal](https://github.com/Mehboobiqbal-dev). If this project helped you, please ⭐ the repo!
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
