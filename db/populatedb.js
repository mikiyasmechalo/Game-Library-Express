import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const connectionString = process.env.DB_URL;

if (!connectionString) {
  throw new Error('No DB_URL environment variable set.');
}

const pool = new Pool({
  connectionString,
});

async function main() {
  const client = await pool.connect();

  try {
    console.log('Starting transaction...');
    await client.query('BEGIN');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS genre (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS publisher (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) UNIQUE NOT NULL,
        release_date DATE NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        description TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS game_genres (
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        genre_id INTEGER REFERENCES genre(id) ON DELETE CASCADE,
        PRIMARY KEY (game_id, genre_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS game_publishers (
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        publisher_id INTEGER REFERENCES publisher(id) ON DELETE CASCADE,
        PRIMARY KEY (game_id, publisher_id)
      );
    `);
    console.log('Tables created successfully.');

    // Populate genres
    const genres = [
      { name: 'Action-Adventure', description: 'Games that combine action gameplay with an ongoing storyline and exploration.' },
      { name: 'RPG', description: 'Games where players assume the roles of characters in a fictional setting.' },
      { name: 'Survival Horror', description: 'A subgenre of action-adventure games that focuses on survival elements in a horror setting.' },
    ];
    for (const genre of genres) {
      await client.query(
        `INSERT INTO genre(name, description) VALUES($1, $2) ON CONFLICT (name) DO NOTHING`,
        [genre.name, genre.description]
      );
    }
    console.log('Genres populated.');

    // Populate publishers
    const publishers = [
      { name: 'Capcom', description: 'A Japanese video game developer and publisher.' },
      { name: 'Square Enix', description: 'A Japanese entertainment conglomerate and video game company.' },
      { name: 'Rockstar Games', description: 'An American video game publisher.' },
      { name: 'Nintendo', description: 'A Japanese multinational video game company.'},
      { name: 'CD Projekt', description: 'A Polish video game developer and publisher.'},
    ];
    for (const publisher of publishers) {
      await client.query(
        `INSERT INTO publisher(name, description) VALUES($1, $2) ON CONFLICT (name) DO NOTHING`,
        [publisher.name, publisher.description]
      );
    }
    console.log('Publishers populated.');

    // Populate games
    const games = [
      {
        title: 'Final Fantasy VII Remake',
        release_date: '2020-04-10',
        rating: 5,
        description: 'A spectacular reimagining of the classic RPG, featuring a new combat system and expanded storyline.',
        genres: ['RPG', 'Action-Adventure'],
        publishers: ['Square Enix', 'Capcom']
      },
      {
        title: 'Resident Evil 2',
        release_date: '2019-01-25',
        rating: 5,
        description: 'A remake of the 1998 classic, offering a tense and atmospheric survival horror experience.',
        genres: ['Survival Horror'],
        publishers: ['Capcom']
      },
      {
        title: 'The Legend of Zelda: Breath of the Wild',
        release_date: '2017-03-03',
        rating: 5,
        description: 'An expansive open-world adventure game that redefined the Zelda franchise.',
        genres: ['Action-Adventure', 'RPG'],
        publishers: ['Nintendo']
      },
      {
        title: 'Grand Theft Auto V',
        release_date: '2013-09-17',
        rating: 5,
        description: 'An action-adventure game played from either a third-person or first-person perspective.',
        genres: ['Action-Adventure'],
        publishers: ['Rockstar Games']
      },
      {
        title: 'Cyberpunk 2077',
        release_date: '2020-12-10',
        rating: 4,
        description: 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.',
        genres: ['RPG', 'Action-Adventure'],
        publishers: ['CD Projekt']
      },
      {
        title: 'The Witcher 3: Wild Hunt',
        release_date: '2015-05-19',
        rating: 5,
        description: 'A story-driven open world RPG set in a visually stunning fantasy universe full of meaningful choices and impactful consequences.',
        genres: ['RPG', 'Action-Adventure'],
        publishers: ['CD Projekt']
      },
    ];

    for (const game of games) {
      const gameResult = await client.query(
        `INSERT INTO games(title, release_date, rating, description) VALUES($1, $2, $3, $4) ON CONFLICT (title) DO NOTHING RETURNING id`,
        [game.title, game.release_date, game.rating, game.description]
      );

      let gameId = null;
      if (gameResult.rows.length > 0) {
        gameId = gameResult.rows[0].id;
      } else {
        const existingGameResult = await client.query('SELECT id FROM games WHERE title = $1', [game.title]);
        gameId = existingGameResult.rows[0].id;
      }

      // Populate game_genres
      for (const genreName of game.genres) {
        const genreResult = await client.query('SELECT id FROM genre WHERE name = $1', [genreName]);
        if (genreResult.rows.length > 0) {
          const genreId = genreResult.rows[0].id;
          await client.query(
            `INSERT INTO game_genres(game_id, genre_id) VALUES($1, $2) ON CONFLICT (game_id, genre_id) DO NOTHING`,
            [gameId, genreId]
          );
        }
      }

      // Populate game_publishers
      for (const publisherName of game.publishers) {
        const publisherResult = await client.query('SELECT id FROM publisher WHERE name = $1', [publisherName]);
        if (publisherResult.rows.length > 0) {
          const publisherId = publisherResult.rows[0].id;
          await client.query(
            `INSERT INTO game_publishers(game_id, publisher_id) VALUES($1, $2) ON CONFLICT (game_id, publisher_id) DO NOTHING`,
            [gameId, publisherId]
          );
        }
      }
    }
    console.log('Games, genres, and publishers successfully associated.');

    await client.query('COMMIT');
    console.log('Transaction committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction rolled back due to error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

main().catch(console.error);
