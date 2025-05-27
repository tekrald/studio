module.exports = {

"[project]/src/actions/assetActions.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"601b7c4d0760f78cd8a48460813746672799273424":"addAsset"} */ __turbopack_context__.s({
    "addAsset": (()=>addAsset)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ addAsset(data, userId) {
    if (!userId) {
        return {
            success: false,
            error: 'Usuário não autenticado.'
        };
    }
    console.log('Simulando adição de ativo (Firebase desabilitado):', {
        userId,
        tipo: data.tipo,
        nomeAtivo: data.nomeAtivo,
        dataAquisicao: data.dataAquisicao,
        observacoes: data.observacoes,
        // valorAtualEstimado: data.valorAtualEstimado, // Removido da simulação do form
        quemComprou: data.quemComprou,
        contribuicaoParceiro1: data.contribuicaoParceiro1,
        contribuicaoParceiro2: data.contribuicaoParceiro2,
        // Campos específicos (serão undefined se não aplicável ao tipo)
        tipoAtivoDigital: data.tipoAtivoDigital,
        quantidadeDigital: data.quantidadeDigital,
        valorPagoEpocaDigital: data.valorPagoEpocaDigital,
        tipoImovelBemFisico: data.tipoImovelBemFisico,
        enderecoLocalizacaoFisico: data.enderecoLocalizacaoFisico,
        documentacaoFisicoFileName: data.documentacaoFisicoFile?.[0]?.name
    });
    // Simula um atraso de rede
    await new Promise((resolve)=>setTimeout(resolve, 500));
    let assetTypeForLog;
    if (data.tipo === 'digital') {
        assetTypeForLog = 'digital';
    } else if (data.tipo === 'fisico') {
        assetTypeForLog = 'fisico';
    } else {
        return {
            success: false,
            error: 'Tipo de ativo inválido.'
        };
    }
    console.log(`Tipo de ativo simulado: ${assetTypeForLog}`);
    // Em uma implementação real com Firebase, você usaria:
    // try {
    //   const commonData = {
    //     userId,
    //     nomeAtivo: data.nomeAtivo,
    //     observacoes: data.observacoes, // Alterado
    //     // valorAtualEstimado: data.valorAtualEstimado, // Removido
    //     quemComprou: data.quemComprou || '',
    //     contribuicaoParceiro1: data.contribuicaoParceiro1,
    //     contribuicaoParceiro2: data.contribuicaoParceiro2,
    //     dataAquisicao: data.dataAquisicao, 
    //     tipo: data.tipo,
    //     createdAt: serverTimestamp(),
    //     updatedAt: serverTimestamp(),
    //   };
    //   let assetDataToSave;
    //   if (data.tipo === 'digital') {
    //     assetDataToSave = {
    //       ...commonData,
    //       tipoAtivoDigital: data.tipoAtivoDigital!, // Alterado
    //       quantidadeDigital: data.quantidadeDigital!,
    //       valorPagoEpocaDigital: data.valorPagoEpocaDigital!,
    //     } // as Omit<DigitalAsset, 'id' | 'valorAtualEstimado'>; // Ajustar Omit se valorAtualEstimado foi removido de DigitalAsset
    //   } else { // fisico
    //     assetDataToSave = {
    //       ...commonData,
    //       tipoImovelBemFisico: data.tipoImovelBemFisico!,
    //       enderecoLocalizacaoFisico: data.enderecoLocalizacaoFisico || '',
    //       // documentacaoFisico: "url_do_arquivo_no_storage" // Lógica de upload seria separada
    //     } // as Omit<PhysicalAsset, 'id' | 'valorAtualEstimado'>; // Ajustar Omit se valorAtualEstimado foi removido de PhysicalAsset
    //   }
    //   const docRef = await addDoc(collection(db!, 'assets'), assetDataToSave); // db! aqui assume que db não é null
    //   return { success: true, assetId: docRef.id };
    // } catch (error) {
    //   console.error('Erro ao adicionar ativo:', error);
    //   return { success: false, error: 'Falha ao adicionar ativo no Firestore.' };
    // }
    return {
        success: true,
        assetId: `mock-asset-${Date.now()}`
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    addAsset
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(addAsset, "601b7c4d0760f78cd8a48460813746672799273424", null);
}}),
"[project]/.next-internal/server/app/(main)/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/assetActions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
;
}}),
"[project]/.next-internal/server/app/(main)/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/assetActions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$assetActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/assetActions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$main$292f$dashboard$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$assetActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(main)/dashboard/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/assetActions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/(main)/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/assetActions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <exports>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "601b7c4d0760f78cd8a48460813746672799273424": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$assetActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addAsset"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$assetActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/assetActions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$main$292f$dashboard$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$assetActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(main)/dashboard/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/assetActions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/(main)/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/assetActions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "601b7c4d0760f78cd8a48460813746672799273424": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$main$292f$dashboard$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$assetActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["601b7c4d0760f78cd8a48460813746672799273424"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$main$292f$dashboard$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$assetActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(main)/dashboard/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/assetActions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <module evaluation>');
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$main$292f$dashboard$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$assetActions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(main)/dashboard/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/assetActions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <exports>');
}}),
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}}),
"[project]/src/app/(main)/layout.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(main)/layout.tsx [app-rsc] (ecmascript)"));
}}),
"[project]/src/app/(main)/dashboard/page.tsx (client reference/proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/(main)/dashboard/page.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/(main)/dashboard/page.tsx <module evaluation>", "default");
}}),
"[project]/src/app/(main)/dashboard/page.tsx (client reference/proxy)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/(main)/dashboard/page.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/(main)/dashboard/page.tsx", "default");
}}),
"[project]/src/app/(main)/dashboard/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/page.tsx (client reference/proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/page.tsx (client reference/proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__);
}}),
"[project]/src/app/(main)/dashboard/page.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(main)/dashboard/page.tsx [app-rsc] (ecmascript)"));
}}),

};

//# sourceMappingURL=_8d235fc1._.js.map