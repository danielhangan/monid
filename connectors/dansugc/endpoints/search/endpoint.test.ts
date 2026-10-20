import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const ID = "dansugc#broll";
const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

for (
    const [scenario, queryParams] of [
        ["happy", { search: "surprised", limit: 2 }],
        ["semantic", {
            semantic_search: "woman laughing at her phone",
            limit: 2,
        }],
    ] as const
) {
    Deno.test(`${ID} ${scenario} (recorded): free, clips carry a credit price`, async () => {
        const result = await runEndpoint({
            unit: await testSealedUnit(ID),
            input: { queryParams },
            mode: "replay",
            fixture: await loadFixture(`${fixturesDir}${scenario}.json`),
        });
        assertEquals(result.httpStatus, 200);
        assertEquals(result.isProviderError, false);
        assertEquals(result.usage, { credits: {}, evidence: {} });
        const videos = (result.output as { videos: { price: number }[] })
            .videos;
        assertEquals(videos.length, 2);
        for (const video of videos) assertEquals(typeof video.price, "number");
    });
}
