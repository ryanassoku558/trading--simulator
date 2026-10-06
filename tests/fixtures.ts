import {test as base, expect} from "@playwright/test";
export const test = base.extend({
  page: async ({page, context}, runFixture) => {
    const freeze = async (p: typeof page) => {await p.clock.setFixedTime(new Date("2026-10-06T00:00:00Z"));};
    context.on("page", freeze);
    await freeze(page);
    await page.route("**/api/community/status", r=>r.fulfill({contentType:"application/json",body:JSON.stringify({community:true,reviews:true})}));
    await page.route("**/rest/v1/learner_reviews**", r=>r.fulfill({contentType:"application/json",body:"[]"}));
    await runFixture(page);
    context.off("page", freeze);
  },
});
export {expect};
