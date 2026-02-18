import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/getAgents",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        // Chama a query interna para pegar os dados
        const agents = await ctx.runQuery(api.audit_check.listAllFull);

        return new Response(JSON.stringify(agents), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Permitir acesso de qualquer lugar (VPS)
            },
        });
    }),
});

export default http;
