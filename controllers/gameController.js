import {
  createGame as createGameDB,
  getGameDetails,
  getAllGames,
  updateGame as updateGameDB,
  deleteGame as deleteGameDB,
} from "../db/queries/gameQueries.js";
import { getAllGenres } from "../db/queries/genreQueries.js";
import { getAllPublishers } from "../db/queries/publisherQueries.js";

export async function showAllGames(req, res) {
  const games = await getAllGames();
  res.render("index", { games });
}

export async function showCreateForm(req, res) {
  const genres = await getAllGenres()
  const publishers = await getAllPublishers()
  res.render('create', {genres, publishers, creating: "game" })
}

async function createGame(req, res) {
  const { title, release_date, rating, description, genres, publishers } =
    req.body;

  // The multiselect fields return a string or an array, so we need to ensure they are arrays
  const genresArray = Array.isArray(genres) ? genres : [genres];
  const publishersArray = Array.isArray(publishers) ? publishers : [publishers];

  const gameData = {
    title,
    release_date,
    rating,
    description,
    genres: genresArray,
    publishers: publishersArray,
  };
  try {
    await createGameDB(gameData);
    res.redirect("/");
  } catch (error) {
    console.error("Error in addGame controller:", error.message);

    res.render("error", { error });
  }
}

export async function showGameDetails(req, res) {
  const gameId = req.params.id;
  const game = await getGameDetails(gameId);
  res.render("detail/gameDetail", { game });
}

export async function showUpdateForm(req, res) {
  try {
    const id = req.params.id;
    const game = await getGameDetails(id);
    const genres = await getAllGenres();
    const publishers = await getAllPublishers();

    res.render("edit", {
      game,
      genres,
      publishers,
      editing: "game"
    });
  } catch (err) {
    res.render("error", { error: err.message });
  }
}

async function updateGame(req, res) {
  const { title, release_date, rating, description, genres, publishers } =
    req.body;
  const { id } = req.params;

  // The multiselect fields return a string or an array, so we need to ensure they are arrays
  const genresArray = Array.isArray(genres) ? genres : [genres];
  const publishersArray = Array.isArray(publishers) ? publishers : [publishers];

  const gameData = {
    title,
    release_date,
    rating,
    description,
    genres: genresArray,
    publishers: publishersArray,
  };
  try {
    await updateGameDB(id, gameData);
    res.redirect("/");
  } catch (error) {
    res.render("error", { error });
  }
}

async function deleteGame(req, res) {
  const id = req.params.id
  try {
    await deleteGameDB(id);
    res.redirect("/");
  } catch (error) {
    res.render("error", { error });
  }
}

export { createGame, updateGame, deleteGame };
