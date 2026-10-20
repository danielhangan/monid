import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const ID = "dansugc#broll/{videoId}";
const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

Deno.test(`${ID} happy (recorded): free, carries the credit price`, async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(ID),
        input: {
            pathParams: { videoId: "7e568b94-329c-4615-a91e-458d2185f83d" },
        },
        mode: "replay",
        fixture: await loadFixture(`${fixturesDir}happy.json`),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});
