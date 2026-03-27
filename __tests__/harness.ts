jest.mock('../dist/index', () => ({
    search: jest.fn()
}));

const { search } = require('../dist/index');
const { normalizeZipCode, fetchOffersByZipCode } = require('../harness');

describe('harness', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('normalizeZipCode accepts 5-digit zip code', () => {
        expect(normalizeZipCode('10115')).toBe(10115);
        expect(normalizeZipCode(' 60487 ')).toBe(60487);
    });

    test('normalizeZipCode rejects invalid zip code', () => {
        expect(() => normalizeZipCode('abcde')).toThrow('ZIP code must contain exactly 5 digits');
        expect(() => normalizeZipCode('1234')).toThrow('ZIP code must contain exactly 5 digits');
    });

    test('fetchOffersByZipCode calls search with zipCode option', async () => {
        const offers = [{ id: 1 }];
        search.mockResolvedValue(offers);

        const result = await fetchOffersByZipCode(10115);

        expect(search).toHaveBeenCalledWith('', { zipCode: 10115 });
        expect(result).toBe(offers);
    });
});
