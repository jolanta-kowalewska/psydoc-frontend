# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Environment variables

This project uses Vite environment variables for AWS Cognito and API configuration. Create a local file named `.env.local` and do not commit it to Git.

Example content:

```dotenv
VITE_USER_POOL_ID=eu-central-1_2QebRHJZk
VITE_USER_POOL_CLIENT_ID=1i3qeuqgv8hu1hm6i0kmgmfu5k
VITE_API_URL=https://wlbk6tig56.execute-api.eu-central-1.amazonaws.com/dev
```

A sample template is available in `.env.local.example`.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
