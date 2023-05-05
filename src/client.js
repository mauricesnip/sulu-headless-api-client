/**
 * Client
 *
 * An API client for SuluHeadlessBundle.
 */
export default class Client {
    basePath;
    baseUrl;
    fetchClient;
    fetchOptions;
    locale;
    onError;
    onResponse;
    removeEmbedded;

    /**
     * Creates a client.
     *
     * @param {Object} [options={}] - The options for the client.
     * @param {String} [options.basePath='/api'] - The base path of the API.
     * @param {String} [options.baseUrl=window.location.origin] - The base URL of the API.
     * @param {Function} [options.fetchClient=fetch.bind(window)] - The fetch client to use.
     * @param {Object} [options.fetchOptions={}] - The options for the fetch client.
     * @param {String} [options.locale=''] - The locale for every request.
     * @param {Function} [options.onError=() => {}] - The function to call on error.
     * @param {Function} [options.onResponse=(r) => r] - The function to call on response.
     * @param {Boolean} [options.removeEmbedded=false] - Whether to remove the _embedded layer from the response if present.
     */
    constructor({
        basePath = '/api',
        baseUrl = window.location.origin,
        fetchClient = fetch.bind(window),
        fetchOptions = {},
        locale = '',
        onError = () => {},
        onResponse = (r) => r,
        removeEmbedded = false,
    } = {}) {
        this.basePath = basePath;
        this.baseUrl = baseUrl;
        this.fetchClient = fetchClient;
        this.fetchOptions = fetchOptions;
        this.locale = locale;
        this.onError = onError;
        this.onResponse = onResponse;
        this.removeEmbedded = removeEmbedded;
    }

    /**
     * Builds a URL with the given path and optional query parameters.
     *
     * @param {String} path - The path for the URL.
     * @param {Object} [options={}] - The options for building the URL.
     * @param {Object} [options.params={}] - The query parameters for the URL.
     * @param {Boolean} [options.withBasePath=true] - Whether to apply the base path.
     * @param {Boolean} [options.withLocale=true] - Whether to prepend locale to path.
     * @returns {URL} The built URL.
     */
    buildUrl(
        path,
        {
            params = {},
            withBasePath = true,
            withLocale = true,
        } = {}
    ) {
        const url = new URL([
            ...(this.locale && withLocale ? [this.locale] : []),
            ...(this.basePath && withBasePath ? [this.basePath] : []),
            path,
        ].join('/').replaceAll('//', '/'), this.baseUrl);

        if(params) {
            url.search = new URLSearchParams(params);
        }

        return url;
    }

    /**
     * Sends a request to the API with the given path and URL options.
     *
     * @param {URL} url - The URL for the request.
     * @returns {Promise<Object>} A Promise that resolves to the request's JSON.
     */
    async request(url) {
        let response = null;

        try {
            response = await this.fetchClient(url.toString(), this.fetchOptions);
        } catch (error) {
            this.onError(error);
            throw error;
        }

        return await this.handleRequestResponse(response);
    }

    /**
     * Handles the response of a request.
     *
     * @param {Response} response - The response object.
     * @returns {Promise<Object>} A Promise that resolves to the request's JSON.
     */
    async handleRequestResponse(response) {
        let json = response.json ? await response.json() : response?.data;

        if (this.removeEmbedded && json?._embedded) {
            json = json._embedded;
        }

        return this.onResponse(json);
    }

    /**
     * Retrieves page data from the given path.
     *
     * @param {String} path - The path of the page to retrieve.
     * @returns {Promise<Object>} A Promise that resolves to the page data.
     */
    getPageByPath(path) {
        return this.request(
            this.buildUrl(`${path}.json`, {
                withBasePath: false,
                withLocale: false,
            })
        );
    }

    /**
     * Retrieves navigation data with the given key and optional query parameters.
     *
     * @param {String} key - The key of the navigation to retrieve.
     * @param {Object} [params] - The query parameters for the request.
     * @returns {Promise<Object>} A Promise that resolves to the navigation data.
     */
    getNavigationByKey(key, params) {
        return this.request(
            this.buildUrl(`/navigations/${key}`, {
                params,
            })
        );
    }

    /**
     * Retrieves snippet data with the given area name and optional query parameters.
     *
     * @param {String} area - The name of the snippet area to retrieve.
     * @param {Object} [params] - The query parameters for the request.
     * @returns {Promise<Object>} A Promise that resolves to the snippet area data.
     */
    getSnippetByArea(area, params) {
        return this.request(
            this.buildUrl(`/snippet-areas/${area}`, {
                params,
            })
        );
    }

    /**
     * Performs a search with the given query.
     *
     * @param {String} query - The search query.
     * @returns {Promise<Object>} A Promise that resolves to the search results.
     */
    search(query) {
        return this.request(
            this.buildUrl('/search', {
                params: {
                    q: query,
                },
            })
        );
    }
}
