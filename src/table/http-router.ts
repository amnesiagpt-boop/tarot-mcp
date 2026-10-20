import { Router } from "express";
import { CardTableService, TableError } from "./card-table-service.js";
export function createCardTableRouter(): ReturnType<typeof Router> {
  const router = Router();
  let service: Promise<CardTableService> | undefined;
  const get = () => (service ??= CardTableService.create());
  const fail = (res: import("express").Response, e: unknown) =>
    res
      .status(e instanceof TableError ? e.status : 500)
      .json({
        code: e instanceof TableError ? e.code : "TABLE_ERROR",
        error:
          e instanceof TableError
            ? e.message
            : "Не удалось подготовить расклад.",
      });
  // Stable public URLs keep browser archives available across preview updates.
  router.post("/api/visual-readings", async (req, res, next) => {
    if (!req.body?.deckId) {
      next();
      return;
    }
    try {
      res.status(201).json({ draw: (await get()).begin(req.body) });
    } catch (e) {
      fail(res, e);
    }
  });
  router.post(
    "/api/visual-readings/:drawId/confirm",
    async (req, res, next) => {
      if (!String(req.params.drawId).startsWith("table_")) {
        next();
        return;
      }
      try {
        if (
          !req.body ||
          Object.keys(req.body).some((k) => k !== "selectedSlotIds")
        )
          throw new TableError(
            "INVALID_INPUT",
            400,
            "Проверь выбранные карты.",
          );
        res.json({
          reading: (await get()).confirm(
            String(req.params.drawId),
            req.body.selectedSlotIds,
          ),
        });
      } catch (e) {
        fail(res, e);
      }
    },
  );
  router.post("/api/deck-readings", async (req, res) => {
    try {
      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
        throw new TableError("INVALID_INPUT", 400, "Требуется объект JSON.");
      res.status(201).json({ draw: (await get()).begin(req.body) });
    } catch (e) {
      fail(res, e);
    }
  });
  router.post("/api/deck-readings/:drawId/confirm", async (req, res) => {
    try {
      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body) ||
        Object.keys(req.body).some((k) => k !== "selectedSlotIds")
      )
        throw new TableError("INVALID_INPUT", 400, "Проверь выбранные карты.");
      res.json({
        reading: (await get()).confirm(
          String(req.params.drawId),
          req.body.selectedSlotIds,
        ),
      });
    } catch (e) {
      fail(res, e);
    }
  });
  return router;
}
