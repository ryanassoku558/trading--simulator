import { beforeEach, expect, it, vi } from "vitest";
import { initialState } from "../lib/trading";
const mocks = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({ supabase: { from: mocks.from } }));
import { loadCloudAccount, saveCloudAccount } from "../lib/storage/cloud";
beforeEach(() => vi.resetAllMocks());
it("loads a validated owner's state and concurrency version", async () => {
  const state = initialState();
  const eq = vi
    .fn()
    .mockReturnValue({
      maybeSingle: async () => ({
        data: { account: state, updated_at: "v1" },
        error: null,
      }),
    });
  mocks.from.mockReturnValue({ select: () => ({ eq }) });
  expect(await loadCloudAccount("owner", "a@example.com")).toEqual({
    state,
    version: "v1",
  });
  expect(eq).toHaveBeenCalledWith("user_id", "owner");
});
it("rejects malformed cloud data", async () => {
  mocks.from.mockReturnValue({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({
          data: { account: { cash: 10000 }, updated_at: "v1" },
          error: null,
        }),
      }),
    }),
  });
  await expect(loadCloudAccount("owner", "a@example.com")).rejects.toThrow(
    "unsupported format",
  );
});
it("rejects stale writes and filters by owner and exact version", async () => {
  const select = vi.fn().mockResolvedValue({ data: [], error: null });
  const chain = { eq: vi.fn(), select };
  chain.eq.mockReturnValue(chain);
  mocks.from.mockReturnValue({ update: () => chain });
  await expect(
    saveCloudAccount("owner", initialState(), "2026-01-01T00:00:00Z"),
  ).rejects.toThrow("another tab or device");
  expect(chain.eq).toHaveBeenCalledWith("user_id", "owner");
  expect(chain.eq).toHaveBeenCalledWith("updated_at", "2026-01-01T00:00:00Z");
});
it("reports database failures rather than claiming saved progress", async () => {
  const chain = {
    eq: vi.fn(),
    select: vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "offline" } }),
  };
  chain.eq.mockReturnValue(chain);
  mocks.from.mockReturnValue({ update: () => chain });
  await expect(
    saveCloudAccount("owner", initialState(), "2026-01-01T00:00:00Z"),
  ).rejects.toThrow("not saved: offline");
});
