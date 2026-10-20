import { expect, it } from "vitest";
import express from "express";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import { mountVisualWebAssets } from "../mcp/static-assets.js";

it("serves each versioned deck from its folder, never a stale root image", async () => {
  const temp = await mkdtemp(join(tmpdir(), "kod-deck-assets-"));
  const cards = join(temp, "assets", "cards");
  await mkdir(join(temp, "mcp"), { recursive: true });
  await mkdir(join(cards, "midnight-art-nouveau-v1"), { recursive: true });
  await mkdir(join(cards, "lenormand-classic-v1"), { recursive: true });
  await writeFile(join(cards, "star.webp"), "stale image");
  await writeFile(
    join(cards, "midnight-art-nouveau-v1", "star.webp"),
    "classic full-resolution face",
  );
  await writeFile(
    join(cards, "lenormand-classic-v1", "lenormand_1.webp"),
    "lenormand face",
  );
  const app = express();
  mountVisualWebAssets(app, join(temp, "mcp"), {
    setDocumentHeaders() {},
    htmlCacheControl: "no-store",
    missingBuildMessage: "missing",
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  try {
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const face = await fetch(
      base + "/assets/cards/midnight-art-nouveau-v1/star.webp?v=classic",
    );
    expect(face.status).toBe(200);
    expect(await face.text()).toBe("classic full-resolution face");
    const other = await fetch(
      base + "/assets/cards/lenormand-classic-v1/lenormand_1.webp",
    );
    expect(await other.text()).toBe("lenormand face");
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
    await rm(temp, { recursive: true, force: true });
  }
});
