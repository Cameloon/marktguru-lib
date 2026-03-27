const readline = require('readline');
const { search } = require('./dist/index');

const normalizeZipCode = (input) => {
    const zipCode = String(input).trim();

    if (!/^\d{5}$/.test(zipCode)) {
        throw new Error('ZIP code must contain exactly 5 digits');
    }

    return Number(zipCode);
};

const fetchOffersByZipCode = async (zipCode) => {
    return search('', { zipCode });
};

const promptZipCode = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve, reject) => {
        rl.question('Enter ZIP code: ', (answer) => {
            rl.close();

            try {
                resolve(normalizeZipCode(answer));
            } catch (error) {
                reject(error);
            }
        });
    });
};

const run = async () => {
    try {
        const zipCode = process.argv[2] !== undefined
            ? normalizeZipCode(process.argv[2])
            : await promptZipCode();
        const offers = await fetchOffersByZipCode(zipCode);
        console.log(JSON.stringify(offers, null, 2));
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
};

if (require.main === module) {
    void run();
}

module.exports = {
    normalizeZipCode,
    fetchOffersByZipCode,
    run
};
