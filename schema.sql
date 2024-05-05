CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_date VARCHAR(255) NOT NULL,
    poster_path VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL
);