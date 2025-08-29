import {
  createGame as createGameDB,
  getGameDetails,
  getAllGames,
  updateGame as updateGameDB,
  deleteGame as deleteGameDB,
} from "../db/queries/gameQueries.js";
import { getAllGenres } from "../db/queries/genreQueries.js";
import { getAllPublishers } from "../db/queries/publisherQueries.js";
import { body, validationResult } from "express-validator";

export async function showAllGames(req, res) {
  const games = await getAllGames();
  res.render("index", { games });
}

const gameValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ min: 1, max: 50 })
    .withMessage("Title cannot be more than 50 characters."),

  body("release_date")
    .isDate()
    .withMessage("Please enter a valid date.")
    .notEmpty()
    .withMessage("Release date is required.")
    .custom((d) => {
      return new Date(d) <= new Date();
    })
    .withMessage("Release date cannot be in the future."),

  body("rating")
    .isNumeric()
    .withMessage("Rating must be a number.")
    .custom((n) => n >= 1 && n <= 5)
    .withMessage("Rating must be between 1 and 5."),

  body("description").optional().trim().escape(),

  body("image")
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL.")
    .custom((link) => {
      const validExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      const extension = link.split(".").pop().toLowerCase();
      if (!validExtensions.includes(extension)) {
        throw new Error(
          "Image URL must end with a valid image extension (jpg, jpeg, png, gif, webp)."
        );
      }
      return true;
    }),

  body("genres")
    .exists()
    .withMessage("At least one genre must be selected.")
    .isArray()
    .withMessage("Genres must be an array of values.")
    .custom((genres) => {
      if (genres.some((genre) => isNaN(parseInt(genre)))) {
        throw new Error("Invalid genre ID.");
      }
      return true;
    }),

  body("publishers")
    .exists()
    .withMessage("At least one publisher must be selected.")
    .isArray()
    .withMessage("Publishers must be an array of values.")
    .custom((publishers) => {
      if (publishers.some((publisher) => isNaN(parseInt(publisher)))) {
        throw new Error("Invalid publisher ID.");
      }
      return true;
    }),
];

export async function showCreateForm(req, res) {
  const genres = await getAllGenres();
  const publishers = await getAllPublishers();
  res.render("create", { genres, publishers, creating: "game" });
}

const createGame = [
  gameValidator,
  async (req, res) => {
    const {
      title,
      release_date,
      rating,
      description,
      genres,
      publishers,
      image,
    } = req.body;

    const genresArray = Array.isArray(genres) ? genres : [genres];
    const publishersArray = Array.isArray(publishers)
      ? publishers
      : [publishers];

    const gameData = {
      title,
      release_date,
      rating,
      description,
      genres: genresArray,
      publishers: publishersArray,
      image,
    };
    try {
      await createGameDB(gameData);
      res.redirect("/");
    } catch (error) {
      console.error("Error in addGame controller:", error.message);

      res.render("error", { error });
    }
  },
];

export async function showGameDetails(req, res) {
  const gameId = req.params.id;
  const game = await getGameDetails(gameId);
  res.render("detail/gameDetails", { game });
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
      editing: "game",
    });
  } catch (err) {
    res.render("error", { error: err.message });
  }
}

const updateGame = [
  gameValidator,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("/games/create", {
        errors: errors.array(),
      });
    }
    const {
      title,
      release_date,
      rating,
      description,
      genres,
      publishers,
      image,
    } = req.body;
    const { id } = req.params;

    // The multiselect fields return a string or an array, so we need to ensure they are arrays
    const genresArray = Array.isArray(genres) ? genres : [genres];
    const publishersArray = Array.isArray(publishers)
      ? publishers
      : [publishers];

    const gameData = {
      title,
      release_date,
      rating,
      description,
      genres: genresArray,
      publishers: publishersArray,
      image,
    };
    try {
      await updateGameDB(id, gameData);
      res.redirect("/");
    } catch (error) {
      res.render("error", { error });
    }
  },
];

async function deleteGame(req, res) {
  const id = req.params.id;
  try {
    await deleteGameDB(id);
    res.redirect("/");
  } catch (error) {
    res.render("error", { error });
  }
}

export { createGame, updateGame, deleteGame };
