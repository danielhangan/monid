import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zPurchasesQueryParams } from "./schema/inputs.ts";

/** GET /broll/purchases — the clips this account has licensed. Free. */
export default defineEndpoint({
    meta: {
        displayName: "List Licensed UGC Clips",
        summary: "List the clips this account has licensed, with fresh " +
            "download links.",
        description: "List the clips this account has licensed: purchase " +
            "id, clip id, title and description, price paid in credits, " +
            "purchase date, and a freshly signed download_url — the way to " +
            "re-download a clip after the link from dansugc#broll/purchase " +
            "expires. Filter by date range (YYYY-MM-DD) or customer_email " +
            "and page with page/limit (max 500). Free.",
        docsUrl: "https://dansugc.com/docs#tag/b-roll/GET/broll/purchases",
        categories: ["stock-media"],
    },
    request: { method: "GET", path: "/broll/purchases" },
    input: { schema: { queryParams: zPurchasesQueryParams } },
    usage: { model: { kind: UsageModelKind.FREE } },
});
