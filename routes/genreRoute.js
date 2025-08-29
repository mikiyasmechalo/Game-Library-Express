import { Router } from "express";
import {
  showAllGenres,
  showGenreDetails,
  creategenre,
  updateGenre,
  deleteGenre,
  showCreateForm,
  showUpdateForm,
} from "../controllers/genreController.js";

const genreRouter = Router();

genreRouter.get("/", showAllGenres);
genreRouter.post("/create", creategenre);

genreRouter.get('/create', showCreateForm)

genreRouter.get("/:id", showGenreDetails);

genreRouter.get("/update/:id", showUpdateForm);
genreRouter.post("/update/:id", updateGenre);
genreRouter.post("/delete/:id", deleteGenre);

export default genreRouter;
