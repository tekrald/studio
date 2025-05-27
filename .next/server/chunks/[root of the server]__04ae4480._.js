module.exports = {

"[project]/.next-internal/server/app/api/crypto-price/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route.runtime.dev.js [external] (next/dist/compiled/next-server/app-route.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/@opentelemetry/api [external] (@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@opentelemetry/api", () => require("@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/app/api/crypto-price/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": (()=>GET)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.mjs [app-route] (ecmascript) <locals>");
;
;
/**
 * API route to fetch cryptocurrency price from CoinMarketCap.
 *
 * Query parameters:
 * - symbol: The cryptocurrency name (e.g., 'Bitcoin', 'Ethereum', 'Solana')
 * - date: The date of acquisition (e.g., 'YYYY-MM-DD')
 */ const SYMBOL_MAP = {
    'Bitcoin': 'BTC',
    'Ethereum': 'ETH',
    'Solana': 'SOL'
};
async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const symbolName = searchParams.get('symbol');
    const dateString = searchParams.get('date'); // Expected YYYY-MM-DD format
    if (!symbolName || !dateString) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Símbolo da moeda e data são obrigatórios'
        }, {
            status: 400
        });
    }
    const apiKey = process.env.COINMARKETCAP_API_KEY;
    if (!apiKey) {
        console.error('COINMARKETCAP_API_KEY não está configurada no servidor.');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Configuração da API do servidor incompleta.'
        }, {
            status: 500
        });
    }
    const cmcSymbol = SYMBOL_MAP[symbolName];
    if (!cmcSymbol) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: `Símbolo da moeda não mapeado: ${symbolName}`
        }, {
            status: 400
        });
    }
    // Format date just to be sure, though it should come as YYYY-MM-DD
    let formattedDate;
    try {
        formattedDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(dateString + 'T00:00:00Z'), 'yyyy-MM-dd'); // Ensure UTC interpretation
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Formato de data inválido.'
        }, {
            status: 400
        });
    }
    // CoinMarketCap API URL for historical quotes
    // We aim for the closing price of the specified day.
    // CMC API needs the date for time_start or time_end.
    // Using interval=daily should give one quote for the day.
    const apiUrl = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical?symbol=${cmcSymbol}&time_start=${formattedDate}&time_end=${formattedDate}&count=1&interval=daily&convert=BRL`;
    try {
        const cmcResponse = await fetch(apiUrl, {
            headers: {
                'X-CMC_PRO_API_KEY': apiKey,
                'Accept': 'application/json'
            }
        });
        if (!cmcResponse.ok) {
            const errorData = await cmcResponse.json();
            console.error('Erro da API CoinMarketCap:', errorData);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Falha ao buscar preço da API externa.',
                details: errorData.status?.error_message || 'Erro desconhecido da CMC'
            }, {
                status: cmcResponse.status
            });
        }
        const data = await cmcResponse.json();
        // Extract the price in BRL
        // The structure is data.data[SYMBOL].quotes[0].quote.BRL.price
        const quotes = data?.data?.[cmcSymbol]?.[0]?.quotes; // CMC v2 returns symbol in data object directly with array of quotes
        if (!quotes || quotes.length === 0) {
            console.error('Resposta da API CoinMarketCap não contém cotações:', data);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Preço não encontrado para a data ou símbolo especificado na resposta da API.'
            }, {
                status: 404
            });
        }
        // Assuming the first quote in the array is for the requested day
        const priceInBRL = quotes[0]?.quote?.BRL?.price;
        if (priceInBRL === undefined || priceInBRL === null) {
            console.error('Preço em BRL não encontrado na cotação:', quotes[0]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Preço em BRL não encontrado para a data ou símbolo especificado.'
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            price: parseFloat(priceInBRL.toFixed(2)),
            currency: 'BRL'
        });
    } catch (error) {
        console.error('Erro ao buscar preço da CoinMarketCap:', error);
        // @ts-ignore
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Erro interno ao buscar preço.',
            details: error.message
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__04ae4480._.js.map