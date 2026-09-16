import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { requireAdmin } from "@/lib/auth/requireAdmin";

function mockGetUser(user: User | null) {
  createClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  });
}

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    createClientMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 when there is no user", async () => {
    mockGetUser(null);

    const result = await requireAdmin();

    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(401);
    expect(result.supabase).toBeUndefined();
  });

  it("returns 403 when the user is not an admin", async () => {
    mockGetUser({
      id: "user-1",
      email: "other@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: "",
    } as User);

    const result = await requireAdmin();

    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(403);
  });

  it("returns 403 when the user has no email", async () => {
    mockGetUser({
      id: "user-1",
      email: undefined,
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: "",
    } as User);

    const result = await requireAdmin();

    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(403);
  });

  it("returns supabase and user for the configured admin", async () => {
    const user = {
      id: "admin-1",
      email: "admin@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: "",
    } as User;
    const supabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user } }),
      },
      from: vi.fn(),
    };
    createClientMock.mockResolvedValue(supabaseClient);

    const result = await requireAdmin();

    expect(result.error).toBeUndefined();
    expect(result.user).toEqual(user);
    expect(result.supabase).toBe(supabaseClient);
  });
});
