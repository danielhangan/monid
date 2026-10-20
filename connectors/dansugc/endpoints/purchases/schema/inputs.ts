import { z } from "zod";
import { zIsoDate } from "../../../schema/common.ts";

/** GET /broll/purchases query — the vendor mirror
 *  (dansugc.com/docs#tag/b-roll/GET/broll/purchases, 2026-10-20). */
export const zPurchasesQueryParams = z.object({
    start_date: zIsoDate.optional(),
    end_date: zIsoDate.optional(),
    customer_email: z.string().email().optional(),
    sort_by: z.enum(["purchased_at", "price_paid", "difficulty_level"])
        .optional(),
    sort_order: z.enum(["asc", "desc"]).optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(500).optional(),
}).strict();
