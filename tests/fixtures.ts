import {test as base, expect} from "@playwright/test";
export const test = base.extend({
  page: async ({page, context}, runFixture) => {
    const freeze = async (p: typeof page) => {await p.clock.setFixedTime(new Date("2026-10-06T00:00:00Z"));};
    context.on("page", freeze);
    await freeze(page);
    await runFixture(page);
    context.off("page", freeze);
  },
});
export {expect};
