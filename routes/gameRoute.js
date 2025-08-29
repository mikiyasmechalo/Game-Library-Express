import { Router } from "express";
import { createGame, deleteGame, showCreateForm, showGameDetails, showUpdateForm, updateGame } from "../controllers/gameController.js";

const gameRouter = Router();

gameRouter.get("/create", showCreateForm)
gameRouter.post("/create", createGame)
gameRouter.post("/delete/:id", deleteGame)
gameRouter.get("/update/:id", showUpdateForm)
gameRouter.post("/update/:id", updateGame)
gameRouter.get("/:id", showGameDetails);

export default gameRouter;
