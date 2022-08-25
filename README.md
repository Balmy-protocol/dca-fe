# Mean Finance FE

This repository contains the code for the Mean Finance public web dApp.

## 👨‍💻 Development environment

- Install dependencies

```bash
yarn install
```

- Run locally on port 3000

```bash
yarn start
```

## 🧪 Linting

```bash
yarn lint
```

Will run linter under [src](./src)

## To update existing translations

- Go to the translations file for the locale you want to update on `/lang/{locale}.json`

- Update the specific strings you want translated

- Generate the new compiled version of the file with:

```bash
yarn formatjs-compile-{locale}
```

## To test a different locale

- Modifiy the `/src/index.tsx` file and change the following line to the locale you want to test

```bash
bootstrapApplication('en');
```

## 📖 Docs

Check our docs at [docs.mean.finance](https://docs.mean.finance)
