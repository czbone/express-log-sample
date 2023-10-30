# Nodejs logging example

Multiple purpose logging example on Nodejs express system by customizing winston.

## Features

- Typescript base
- using Winston module
- MongoDB error logging
- logging to console and file(json)
- logging HTTP request context
　
## Environment

- Node v18.0 above
- MongoDB v6.0

## How to use

1. Install module

```bash
# yarn
yarn install

# npm
npm install
```

2. Setup

Edit `.env` file:

```
MONGO_URL=mongodb://localhost:27017/sampleDB
```

3. Launch server

If using VSCode, show the `Run and Debug` view and launch `Start server` from `Debugging start` menu.
If using command, input below.

```bash
# yarn
yarn dev

# npm
npm run dev
```

Start the development server on http://localhost:3000
with logging files in `logs` directory.

## Production build

1. Edit `.env` file for production:

```
NODE_ENV=production
```

2. Build application:

```bash
# yarn
yarn build

# npm
npm run build
```

3. Launch application:

```bash
# yarn
yarn start

# npm
npm start
```

## License

[MIT](./LICENSE)
