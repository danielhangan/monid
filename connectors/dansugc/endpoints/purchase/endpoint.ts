import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zPurchaseBody } from "./schema/inputs.ts";

/**
 * POST /broll/purchase — license clips and get their download links.
 *
 * TWO-STEP CONFIRM (vendor contract): a call without `expected_total_cents`
 * (or with a stale one) charges nothing and answers 409
 * `{requiresConfirmation, expectedTotalCents}` — error-as-data, zero usage;
 * the caller repeats the call with that value to buy. Clips the account
 * already owns come back under `already_purchased` and are not charged.
 *
 * BILLING: metered in DansUGC credits. The rate card is 11 credits per
 * video and 8 per image (dansugc.com/api/pricing/settings
 * `broll.videoListCents` / `imageListCents`), lowered by any live sale —
 * so the meter counts CREDITS, not clips: evidence sums each fresh
 * purchase's `price_paid`, and the vendor's own `total_amount` is the
 * claim. The estimate is the worst case: every id a fresh video at list.
 */
export default defineEndpoint({
    meta: {
        displayName: "License UGC Clips",
        summary: "License real-human UGC clips and get full-quality " +
            "download links.",
        description: "License 1–50 clips (ids from dansugc#broll) for " +
            "commercial use in ads and organic posts, and get each clip's " +
            "full-quality, unwatermarked download_url (signed, valid for " +
            "about an hour — dansugc#broll/purchases re-issues them). Two " +
            "steps: call with just `video_ids` to get the exact total — " +
            "that answers 409 with `expected_total_cents` and charges " +
            "nothing — then call again with `expected_total_cents` set to " +
            "that value to buy. A video is 11 DansUGC credits and an image " +
            "8; clips the account already owns are returned under " +
            "`already_purchased` at no charge.",
        docsUrl: "https://dansugc.com/docs#tag/b-roll/POST/broll/purchase",
        categories: ["stock-media"],
        notes: [
            "The 409 confirmation step is free and is the way to quote a " +
            "basket before buying; a 402 means the balance cannot cover " +
            "it. Both settle with zero usage.",
        ],
    },
    request: { method: "POST", path: "/broll/purchase" },
    input: { schema: { body: zPurchaseBody } },
    usage: {
        /** 1 per DansUGC credit charged (design D3): the per-clip price
         *  varies by media type and live sale, so credits are the unit. */
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.CREDIT,
            label: "credits charged",
            description: "DansUGC credits charged for freshly licensed " +
                "clips (11 per video, 8 per image at list; already-owned " +
                "clips are free)",
            consumes: { credit: "default", amount: 1 },
        },
        /** Worst case: every id is a fresh video at the 11-credit list
         *  price (typed read of the validated input — design D25). */
        estimate: ({ data }) => ({
            counts: { CREDIT: data.input.body.video_ids.length * 11 },
        }),
        /** Sum of `price_paid` over this call's fresh purchases; owned
         *  clips (`already_purchased`) carry no price. */
        evidence: ({ data, utils }) => {
            const rows = utils.json.optionalGet(data.output, "$.purchases");
            const paid = (Array.isArray(rows) ? rows : [])
                .map((row) =>
                    typeof row === "object" && row !== null &&
                        !Array.isArray(row) &&
                        typeof row.price_paid === "number"
                        ? row.price_paid
                        : 0
                )
                .reduce((sum, value) => sum + value, 0);
            return { counts: { CREDIT: paid } };
        },
        /** The vendor's own charge, `total_amount` (credits), is the
         *  CLAIM. Absent → the derived fold settles, never a silent zero. */
        consolidate: ({ data, utils }) => {
            const total = utils.json.optionalGet(data.output, "$.total_amount");
            return {
                credits: {
                    ...(typeof total === "number" ? { default: total } : {}),
                },
            };
        },
    },
});
