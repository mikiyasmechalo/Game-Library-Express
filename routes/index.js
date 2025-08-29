import { Router } from "express";
import { showAllGames } from "../controllers/gameController.js";
import publisherRouter from "./publisherRoutes.js";
import genreRouter from "./genreRoute.js";
import gameRouter from "./gameRoute.js";

export const indexRouter = Router();

indexRouter.get("/", showAllGames);

indexRouter.use("/games", gameRouter);
indexRouter.use("/publishers", publisherRouter);
indexRouter.use("/genres", genreRouter);

indexRouter.use((req, res) => {
  res.render("notFound");
});
