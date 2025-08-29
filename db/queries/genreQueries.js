import pool from "../pool.js";

export async function getAllGenres() {
  const { rows } = await pool.query(`
    SELECT * FROM genre
    `);
    return rows;
}

export async function getGenreDetails(id) {
  const { rows } = await pool.query(
    `
    SELECT
      g.id,
      g.name,
      g.description,
      json_agg(
        jsonb_build_object(
          'id', game.id,
          'title', game.title
        )
      ) AS games
    FROM genre AS g
    LEFT JOIN game_genres AS gg ON g.id = gg.genre_id
    LEFT JOIN game ON gg.game_id = game.id
    WHERE g.id = ($1)
    GROUP BY g.id, g.name, g.description;
    `,
    [id]
  );

  return rows[0];
}

export async function createGenre(name, description) {
  try {
    const SQL = `
      INSERT INTO genre
      (name, description) 
      VALUES ($1, $2)
    `;
    const result = await pool.query(SQL, [name, description]);
    console.log(`Created new genre: ${name}`);
    return result;
  } catch (err) {
    console.error("Error creating genre:", err);
    throw err;
  }
}

export async function updateGenre(id, name, description) {
  try {
    const query = `
      UPDATE genre
      SET name = $1, description = $2
      WHERE id = $3;
    `;
    const result = await pool.query(query, [name, description, id]);
    console.log(`Updated genre with ID: ${id}`);
    return result;
  } catch (err) {
    console.error("Error updating genre:", err);
    throw err;
  }
}

export async function deleteGenre(id) {
  try {
    const query = `
      DELETE FROM genre
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    console.log(`Deleted genre with ID: ${id}`);
    return result;
  } catch (err) {
    console.error("Error deleting genre:", err);
    throw err;
  }
}