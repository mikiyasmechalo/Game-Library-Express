import pool from "../pool.js";

export async function getAllPublishers() {
  const { rows } = await pool.query(`
    SELECT * 
    FROM publisher
    `)
    return rows;
}

export async function getPublisherDetails(id) {
  const { rows } = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      json_agg(
        jsonb_build_object(
          'id', game.id,
          'title', game.title
        )
      ) AS games
    FROM publisher AS p
    LEFT JOIN game_publishers AS gp ON p.id = gp.publisher_id
    LEFT JOIN game ON gp.game_id = game.id
    WHERE p.id = ($1)
    GROUP BY p.id, p.name, p.description;
    `,
    [id]
  );
  return rows[0];
}

export async function createPublisher(name, description) {
  try {
    const SQL = `
      INSERT INTO publisher
      (name, description) 
      VALUES ($1, $2)
    `;
    const result = await pool.query(SQL, [name, description]);
    console.log(`Created new publisher: ${name}`);
    return result;
  } catch (err) {
    console.error("Error creating publisher:", err);
    throw err;
  }
}

export async function updatePublisher(id, name, description) {
  try {
    const query = `
      UPDATE publisher
      SET name = $1, description = $2
      WHERE id = $3;
    `;
    const result = await pool.query(query, [name, description, id]);
    console.log(`Updated publisher with ID: ${id}`);
    return result;
  } catch (err) {
    console.error("Error updating publisher:", err);
    throw err;
  }
}

export async function deletePublisher(id) {
  try {
    const query = `
      DELETE FROM publisher
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    console.log(`Deleted publisher with ID: ${id}`);
    return result;
  } catch (err) {
    console.error("Error deleting publisher:", err);
    throw err;
  }
}

