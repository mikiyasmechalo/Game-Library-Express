import {
  getGenreDetails,
  getAllGenres,
  createGenre as createGenreDB,
  updateGenre as updateGenreDB,
  deleteGenre as deleteGenreDB,
} from "../db/queries/genreQueries.js";
import { body, validationResult } from "express-validator";

export const validator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .custom(async (name) => {
      const genres = await getAllGenres();
      genres.forEach((g) => {
        if (g.name === name) throw Error("Duplicate Name Found.");
      });
    }),
  body("description").trim().optional().escape(),
];

async function showAllGenres(req, res) {
  const genres = await getAllGenres();
  res.render("all/allGenres", { genres });
}

async function showGenreDetails(req, res) {
  const genreId = req.params.id;
  const genre = await getGenreDetails(genreId);
  res.render("detail/genreDetails", { genre });
}

const creategenre = [
  validator,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("/genres/create", {
        errors: errors.array(),
      });
    }
    try {
      const { name, description } = req.body;
      await createGenreDB(name, description);
      res.redirect("/genres");
    } catch (error) {
      console.error("Error creating genre:", err);
      res.render("error", { error });
    }
  },
];

export async function showCreateForm(req, res) {
  res.render("create", { creating: "genre" });
}

export async function showUpdateForm(req, res) {
  const id = req.params.id;
  const genre = await getGenreDetails(id);
  res.render("edit", { editing: "genre", genre: genre });
}

const updateGenre = [
  validator,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      await updateGenreDB(id, name, description);
      res.redirect("/genres");
    } catch (error) {
      console.error("Error updating genre:", error);
      res.render("error", { error });
    }
  },
];

async function deleteGenre(req, res) {
  try {
    const { id } = req.params;
    await deleteGenreDB(id);
    res.redirect("/genres");
  } catch (error) {
    console.error("Error deleting genre:", error);
    res.render("error", { error });
  }
}

export {
  creategenre,
  updateGenre,
  deleteGenre,
  showAllGenres,
  showGenreDetails,
};
