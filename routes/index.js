import { Router } from "express";
import { showAllGames } from "../controllers/gameController.js";
import publisherRouter from "./publisherRoutes.js";
import genreRouter from "./genreRoute.js";
import { createGame } from "../controllers/gameController.js";
import gameRouter from "./gameRoute.js";

export const indexRouter = Router();

indexRouter.get("/", showAllGames);

indexRouter.use("/game", gameRouter);
indexRouter.use("/publisher", publisherRouter);
indexRouter.use("/genre", genreRouter);

indexRouter.use((req, res) => {
  res.render("notFound");
});
