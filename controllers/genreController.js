import {
  getGenreDetails,
  getAllGenres,
  createGenre as createGenreDB,
  updateGenre as updateGenreDB,
  deleteGenre as deleteGenreDB
} from "../db/queries/genreQueries.js";

async function showAllGenres(req, res) {
  const genres = await getAllGenres();
  res.render("all/allGenres", { genres });
}

async function showGenreDetails(req, res) {
  const genreId = req.params.id;
  const genre = await getGenreDetails(genreId);
  res.render("detail/genreDetails", { genre });
}

async function creategenre(req, res) {
  try {
    const { name, description } = req.body;
    await createGenreDB(name, description);
    res.redirect("/genre");
  } catch (error) {
    console.error("Error creating genre:", err);
    res.render("error", { error });
  }
}

export async function showCreateForm(req, res) {
  res.render("create", { creating: "genre" });
}

export async function showUpdateForm(req, res) {
  const id = req.params.id;
  const genre = await getGenreDetails(id);
  res.render("edit", { editing: "genre", genre: genre });
}

async function updateGenre(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    await updateGenreDB(id, name, description);
    res.redirect("/genre");
  } catch (error) {
    console.error("Error updating genre:", error);
    res.render("error", { error });
  }
}
async function deleteGenre(req, res) {
  try {
    const { id } = req.params;
    await deleteGenreDB(id);
    res.redirect("/genre");
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
