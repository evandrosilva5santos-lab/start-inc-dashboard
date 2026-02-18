
const { ConvexHttpClient } = require('convex/browser');
const { api } = require('../convex/_generated/api');
require('dotenv').config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function main() {
    console.log('🔍 Inspecionando duplicatas...');
    const result = await client.action(api.inspect.inspectDuplicates);

    console.log('--- RELATÓRIO DE DUPLICATAS ---');
    console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
