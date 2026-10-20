import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const ID = "dansugc#broll/purchases";
const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

Deno.test(`${ID} happy (recorded): free, re-issues download links`, async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(ID),
        input: { queryParams: { limit: 1 } },
        mode: "replay",
        fixture: await loadFixture(`${fixturesDir}happy.json`),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});
