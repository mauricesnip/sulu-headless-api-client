# Sulu Headless API Client

This module provides a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) based way to work with the [`SuluHeadlessBundle`](https://github.com/sulu/SuluHeadlessBundle) JSON API.

<p>
    <img src="https://img.shields.io/badge/npm-v1.0.0-blue">
    <img src="https://img.shields.io/badge/license-MIT-green">
</p>

## Installation

```sh
# With npm
npm install sulu-headless-api-client

# Or yarn
yarn add sulu-headless-api-client
```

## Basic usage

```javascript
import Client from 'sulu-headless-api-client';

// Create client
const client = new Client();

// Get page data
client
    .getPageByPath(window.location.pathname)
    .then((page) => {
        // Do something with page data...
    });
```

## Advanced usage

```javascript
import Client from 'sulu-headless-api-client';
import sortNavigation from './helpers/sortNavigation';

// Create client
const navigationClient = new Client({
    baseUrl: process.env.SULU_BASE_URL,
    removeEmbedded: true,
    onResponse: (response) => sortNavigation(response),
});

// Get navigation data
navigationClient
    .getNavigationByKey('main', {
        depth: 3,
        excerpt: true,
        flat: true,
    })
    .then((navigation) => {
        // Do something with navigation data...
    });
```

Or with [Axios](https://axios-http.com/).

```javascript
import Client from 'sulu-headless-api-client';
import axios from 'axios';
import sortNavigation from './helpers/sortNavigation';

// Create client
const navigationClient = new Client({
    baseUrl: process.env.SULU_BASE_URL,
    fetchClient: axios,
    fetchOptions: {
        transformResponse: (response) => sortNavigation(response),
    },
    removeEmbedded: true,
});

// Get navigation data
navigationClient
    .getNavigationByKey('main', {
        depth: 3,
        excerpt: true,
        flat: true,
    })
    .then((navigation) => {
        // Do something with navigation data...
    });
```

## Error handling

```javascript
import Client from 'sulu-headless-api-client';
import handleError from './helpers/handleError';
import handleSearchError from './helpers/handleSearchError';

// Client wide
const client = new Client({
    onError: (error) => handleError(error),
});

// Or per method
client
    .getPageByPath(window.location.pathname)
    .then((page) => {
        // Do something with page data...
    })
    .catch((error) => handleError(error));

client
    .search(query)
    .then((hits) => {
        // Do something with hits...
    })
    .catch((error) => handleSearchError(error));
```

## Constructor

### `const client = new Client(options)`

Creates a client.

#### Parameters

| Parameter                | Required? | Type                | Default                    | Description                                                           |
|:-------------------------|:----------|:--------------------|:---------------------------|:----------------------------------------------------------------------|
| `options`                | No        | `Object`            | `{}`                       | The options for the client.                                           |
| `options.baseUrl`        | No        | `string`            | `window.location.pathname` | The base URL for the API.                                             |
| `options.fetchClient`    | No        | `Function`          | `fetch`                    | The fetch client to use. Tested with `fetch` and `axios`.             |
| `options.fetchOptions`   | No        | `Object`            | `{}`                       | The fetch client options.                                             |
| `options.onError`        | No        | `Function(error)`   | `() => {}`                 | The function to call on error.                                        |
| `options.onResponse`     | No        | `Function(reponse)` | `(r) => r`                 | The function to call on response.                                     |
| `options.removeEmbedded` | No        | `boolean`           | `false`                    | Whether to remove the `_embedded` layer from the response if present. |

## Instance methods

### `client.getPageByPath(path)`

Retrieves page data from the given path.

#### Parameters

| Parameter | Required? | Type     | Default | Description                       |
|:----------|:----------|:---------|:--------|:----------------------------------|
| `path`    | Yes       | `string` | -       | The path of the page to retrieve. |

#### Return value

A `Promise` that resolves to the page data.

### `client.getNavigationByKey(key[, params])`

Retrieves navigation data with the given key and optional query parameters.

#### Parameters

| Parameter        | Required? | Type      | Default | Description                                |
|:-----------------|:----------|:----------|:--------|:-------------------------------------------|
| `key`            | Yes       | `string`  | -       | The key of the navigation to retrieve.     |
| `params`         | No        | `Object`  | `{}`    | The query parameters for the request.      |
| `params.depth`   | No        | `number`  | `1`     | The maximum depth of the navigation.       |
| `params.excerpt` | No        | `boolean` | `false` | Whether to include excerpt data.           |
| `params.flat`    | No        | `boolean` | `false` | Whether to return as list instead of tree. |

#### Return value

A `Promise` that resolves to the navigation data.

### `client.getSnippetByArea(area[, params])`

Retrieves snippet data with the given area name and optional query parameters.

#### Parameters

| Parameter                 | Required? | Type      | Default | Description                               |
|:--------------------------|:----------|:----------|:--------|:------------------------------------------|
| `area`                    | Yes       | `string`  | -       | The name of the snippet area to retrieve. |
| `params`                  | No        | `Object`  | `{}`    | The query parameters for the request.     |
| `params.includeExtension` | No        | `boolean` | `false` | Whether to include extension data.        |

#### Return value

A `Promise` that resolves to the snippet area data.

### `client.search(query)`

Performs a search with the given query.

#### Parameters

| Parameter | Required? | Type     | Default | Description       |
|:----------|:----------|:---------|:--------|:------------------|
| `query`   | Yes       | `string` | -       | The search query. |

#### Return value

A `Promise` that resolves to the search results.

## Testing

Run `yarn test` to fire up the [Mockoon CLI](https://mockoon.com/cli/) mock API and run all [Playwright](https://playwright.dev/) tests. Don't worry, everything stops after testing has finished.

## License
Licensed under [MIT](./LICENSE).
