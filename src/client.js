/**
 * Client
 *
 * An API client for SuluHeadlessBundle.
 */
export default class Client {
    baseUrl;
    fetchClient;
    fetchOptions;
    onError;
    onResponse;
    removeEmbedded;

    /**
     * Creates a client.
     *
     * @param {Object} options - The options for the client.
     * @param {string} [options.baseUrl=window.location.origin] - The base URL for the API.
     * @param {function} [options.fetchClient=fetch.bind(window)] - The fetch client to use.
     * @param {Object} [options.fetchOptions={}] - The fetch client options.
     * @param {function} [options.onError=() => {}] - The function to call on error.
     * @param {function} [options.onResponse=(r) => r] - The function to call on response.
     * @param {boolean} [options.removeEmbedded=false] - Whether to remove the _embedded layer from the response if present.
     */
    constructor({
        baseUrl = window.location.origin,
        fetchClient = fetch.bind(window),
        fetchOptions = {},
        onError = () => {},
        onResponse = (r) => r,
        removeEmbedded = false,
    }) {
        this.baseUrl = baseUrl;
        this.fetchClient = fetchClient;
        this.fetchOptions = fetchOptions;
        this.onError = onError;
        this.onResponse = onResponse;
        this.removeEmbedded = removeEmbedded;
    }

    /**
     * Builds a URL with the given path and optional query parameters.
     *
     * @param {string} path - The path for the URL.
     * @param {Object} [params={}] - The query parameters for the URL.
     * @returns {URL} The built URL.
     */
    buildUrl(path, params = {}) {
        const url = new URL(path, this.baseUrl);
        url.search = new URLSearchParams(params);

        return url;
    }

    /**
     * Sends a request to the API with the given path and query parameters.
     *
     * @param {string} path - The path for the request.
     * @param {Object} [params={}] - The query parameters for the request.
     * @returns {Promise<Object>} A Promise that resolves to the request's JSON.
     */
    async request(path, params = {}) {
        let response = null;

        try {
            response = await this.fetchClient(
                this.buildUrl(path, params).toString(),
                this.fetchOptions
            );
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
        let json = response.json ? await response.json() : response.data;

        if (this.removeEmbedded && json?._embedded) {
            json = json._embedded;
        }

        return this.onResponse(json);
    }

    /**
     * Retrieves page data from the given path.
     *
     * @param {string} path - The path of the page to retrieve.
     * @returns {Promise<Object>} A Promise that resolves to the page data.
     */
    getPageByPath(path) {
        return this.request(`${path}.json`);
    }

    /**
     * Retrieves navigation data with the given key and optional query parameters.
     *
     * @param {string} key - The key of the navigation to retrieve.
     * @param {Object} [params] - The query parameters for the request.
     * @returns {Promise<Object>} A Promise that resolves to the navigation data.
     */
    getNavigationByKey(key, params) {
        return this.request(`/api/navigations/${key}`, params);
    }

    /**
     * Retrieves snippet data with the given area name and optional query parameters.
     *
     * @param {string} area - The name of the snippet area to retrieve.
     * @param {Object} [params] - The query parameters for the request.
     * @returns {Promise<Object>} A Promise that resolves to the snippet area data.
     */
    getSnippetByArea(area, params) {
        return this.request(`/api/snippet-areas/${area}`, params);
    }

    /**
     * Performs a search with the given query.
     *
     * @param {string} query - The search query.
     * @returns {Promise<Object>} A Promise that resolves to the search results.
     */
    search(query) {
        return this.request('/api/search', {
            q: query,
        });
    }
}
