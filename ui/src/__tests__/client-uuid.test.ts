import { afterEach, expect, it, vi } from "vitest";
import { createClientUuid } from "../client-uuid.js";

afterEach(() => vi.unstubAllGlobals());

it("starts readings on HTTP previews without crypto.randomUUID", () => {
  const getRandomValues = globalThis.crypto.getRandomValues.bind(globalThis.crypto);
  vi.stubGlobal("crypto", { getRandomValues });
  const first = createClientUuid();
  const second = createClientUuid();
  const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  expect(first).toMatch(uuidV4);
  expect(second).toMatch(uuidV4);
  expect(second).not.toBe(first);
});
