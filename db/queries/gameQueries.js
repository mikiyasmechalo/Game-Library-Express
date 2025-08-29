import pool from "../pool.js";

export async function getAllGames() {
  const { rows } = await pool.query(`
    SELECT
        g.id,
        g.title,
        g.release_date,
        g.rating,
        g.description,
        g.image,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', ge.id,
            'name', ge.name,
            'description', ge.description
          )
        ) AS genres,
        json_agg(
          DISTINCT jsonb_build_object( 
            'id', p.id,
            'name', p.name,
            'description', p.description
          )
        ) AS publishers
    FROM game AS g
    LEFT JOIN game_genres AS gg ON g.id = gg.game_id
    LEFT JOIN genre AS ge ON gg.genre_id = ge.id
    LEFT JOIN game_publishers AS gp ON g.id = gp.game_id
    LEFT JOIN publisher AS p ON gp.publisher_id = p.id
    GROUP BY g.id
    ORDER BY g.title;
  `);
  return rows;
}

export async function getGameDetails(id) {
  const { rows } = await pool.query(
    `
    SELECT
    g.id,
    g.title,
    g.release_date,
    g.rating,
    g.description,
    g.image,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', ge.id,
            'name', ge.name,
            'description', ge.description
          )
        ) AS genres,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'description', p.description
          )
        ) AS publishers
    FROM game AS g
    LEFT JOIN game_genres AS gg ON g.id = gg.game_id
    LEFT JOIN genre AS ge ON gg.genre_id = ge.id
    LEFT JOIN game_publishers AS gp ON g.id = gp.game_id
    LEFT JOIN publisher AS p ON gp.publisher_id = p.id
    WHERE g.id = ($1)
    GROUP BY g.title, g.release_date, g.rating, g.description, g.id
  `,
    [id]
  );
  return rows[0];
}

export async function createGame(gameData) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const gameInsertSql = `
      INSERT INTO game(title, release_date, rating, description, image)
      VALUES($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const gameResult = await client.query(gameInsertSql, [
      gameData.title,
      gameData.release_date,
      gameData.rating,
      gameData.description,
      gameData.image
    ]);
    const gameId = gameResult.rows[0].id;

    // Loop through genres and insert into the join table
    for (const genreId of gameData.genres) {
      const genreLinkSql = `
        INSERT INTO game_genres(game_id, genre_id)
        VALUES($1, $2)
        ON CONFLICT DO NOTHING
      `;
      await client.query(genreLinkSql, [gameId, genreId]);
    }

    // Loop through publishers and insert into the join table
    for (const publisherId of gameData.publishers) {
      const publisherLinkSql = `
        INSERT INTO game_publishers(game_id, publisher_id)
        VALUES($1, $2)
        ON CONFLICT DO NOTHING
      `;
      await client.query(publisherLinkSql, [gameId, publisherId]);
    }

    await client.query("COMMIT");
    console.log("Game created successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating game:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateGame(id, gameData) {
  const { title, release_date, rating, description, genres, publishers, image } =
    gameData;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Update the main games table
    const updateGameQuery = `
      UPDATE game
      SET title = $1, release_date = $2, rating = $3, description = $4, image = $5
      WHERE id = $6
    `;
    await client.query(updateGameQuery, [
      title,
      release_date,
      rating,
      description,
      image,
      id,
    ]);

    // 2. Clear old genre and publisher associations
    const deleteGenresQuery = `DELETE FROM game_genres WHERE game_id = $1`;
    await client.query(deleteGenresQuery, [id]);

    const deletePublishersQuery = `DELETE FROM game_publishers WHERE game_id = $1`;
    await client.query(deletePublishersQuery, [id]);

    // 3. Add new genre associations
    if (genres && genres.length > 0) {
      for (const genreId of genres) {
        const insertGenreQuery = `INSERT INTO game_genres (game_id, genre_id) VALUES ($1, $2)`;
        await client.query(insertGenreQuery, [id, genreId]);
      }
    }

    // 4. Add new publisher associations
    if (publishers && publishers.length > 0) {
      for (const publisherId of publishers) {
        const insertPublisherQuery = `INSERT INTO game_publishers (game_id, publisher_id) VALUES ($1, $2)`;
        await client.query(insertPublisherQuery, [id, publisherId]);
      }
    }

    // If all queries succeed, commit the transaction
    await client.query("COMMIT");
    console.log(`Updated game with ID: ${id}`);
  } catch (err) {
    // If any query fails, roll back the transaction
    await client.query("ROLLBACK");
    console.error("Error updating game:", err);
    throw err;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

export async function deleteGame(id) {
  try {
    const query = `
      DELETE FROM game
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    console.log(`Deleted Game with ID: ${id}`);
    return result;
  } catch (err) {
    console.error("Error deleting Game:", err);
    throw err;
  }
}
