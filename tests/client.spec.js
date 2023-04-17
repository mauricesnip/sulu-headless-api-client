import { test, expect } from '@playwright/test';
import Client  from '../src/client.js';
import axios from 'axios';

// Provide origin
global.window = {
    location: {
        origin: 'http://127.0.0.1:3000',
    },
};

// Client tests
test.describe('Client', () => {
    let client;

    // Single client for all tests
    test.beforeAll(async () => {
        client = new Client({});
    });

    // Feature tests
    test('should build a correct URL without params', async () => {
        const url = client.buildUrl('/test');
        expect(url.toString()).toBe(`${client.baseUrl}/test`);
    });

    test('should build a correct URL with params', async () => {
        const url = client.buildUrl('/test', {
            foo: 'bar',
            baz: 'qux',
        });
        expect(url.toString()).toBe(`${client.baseUrl}/test?foo=bar&baz=qux`);
    });

    test('should build a correct URL with falsy params', async () => {
        const url = client.buildUrl('/test', false);
        expect(url.toString()).toBe(`${client.baseUrl}/test`);
    });

    test('should transform response', async () => {
        const originalOnResponse = client.onResponse;
        const transformedResponse = {
            transformed: true,
        };
        client.onResponse = () => transformedResponse;
        const data = await client.getNavigationByKey('main');
        client.onResponse = originalOnResponse;
        expect(data).toMatchObject(transformedResponse);
    });

    test('should remove _embedded layer', async () => {
        const originalRemoveEmbedded = client.removeEmbedded;
        client.removeEmbedded = true;
        const data = await client.getNavigationByKey('main');
        client.removeEmbedded = originalRemoveEmbedded;
        expect(data).not.toHaveProperty('_embedded');
    });

    test('should throw error if request fails', async () => {
        try {
            await client.request('/api/fail');
        } catch (error) {
            expect(() => {
                throw error;
            }).toThrow();
        }
    });

    test('should work with Axios as fetchClient', async () => {
        const originalFetchClient = client.fetchClient;
        client.fetchClient = axios;
        const data = await client.getPageByPath('/lorem-ipsum');
        client.fetchClient = originalFetchClient;
        expect(data.content.title).toBe('Lorem ipsum');
    });

    // API tests
    test('should retrieve page data by path', async () => {
        const data = await client.getPageByPath('/lorem-ipsum');
        expect(data.content.title).toBe('Lorem ipsum');
    });

    test('should retrieve navigation data by key', async () => {
        const data = await client.getNavigationByKey('main');
        expect(data).toHaveProperty('_embedded.items');
    });

    test('should retrieve snippet data by area name', async () => {
        const data = await client.getSnippetByArea('default');
        expect(data.content.title).toBe('Lorem ipsum');
    });

    test('should perform a search with the given query', async () => {
        const data = await client.search('lorem');
        expect(data).toHaveProperty('_embedded.hits');
    });

    test('should retrieve localized page data by path', async () => {
        const originalLocale = client.locale;
        client.locale = 'en';
        const data = await client.getPageByPath('/en/hello-world');
        client.locale = originalLocale;
        expect(data.content.title).toBe('Hello world');
    });

    test('should retrieve localized snippet data by area name', async () => {
        const originalLocale = client.locale;
        client.locale = 'en';
        const data = await client.getSnippetByArea('default');
        client.locale = originalLocale;
        expect(data.content.title).toBe('Hello world');
    });
});
