import test from 'node:test';
import assert from 'node:assert/strict';
import { getApiErrorMessage } from './auth.api.js';

test('returns the API message when the server provides one', () => {
    const message = getApiErrorMessage({
        response: {
            data: { message: 'Email already exists' }
        }
    });

    assert.equal(message, 'Email already exists');
});

test('falls back to a generic message when no API message exists', () => {
    const message = getApiErrorMessage({ message: 'Network Error' });

    assert.equal(message, 'Network Error');
});
