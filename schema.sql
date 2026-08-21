CREATE TABLE users (
    id serial PRIMARY KEY,
    name VARCHAR(55) NOT NULL,
    email VARCHAR(55) NOT NULL UNIQUE,
    password text NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE countries (
    id serial primary key,
    name varchar(50) not null,
    created_at timestamp default now(),
    updated_at timestamp default now()
);

CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    country_id INTEGER NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL,
    price int NOT NULL DEFAULT 0,
    rating int NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT places_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT places_country_fk
        FOREIGN KEY (country_id)
        REFERENCES countries(id)
        ON DELETE RESTRICT
);

CREATE TABLE place_images (
    id SERIAL PRIMARY KEY,
    place_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT place_images_place_fk
        FOREIGN KEY (place_id)
        REFERENCES places(id)
        ON DELETE CASCADE
);

create table place_ratings (
    id serial primary key,
    user_id integer not null references users(id) on delete cascade,
    place_id integer not null references places(id) on delete cascade,
    rating integer not null check (rating >= 1 and rating <= 5),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    unique (user_id, place_id)
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL CHECK (guests_count >= 1 AND guests_count <= 20),
  total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_dates_check CHECK (check_out > check_in)
);

CREATE INDEX bookings_place_dates_idx
  ON bookings (place_id, check_in, check_out);

CREATE INDEX bookings_user_created_idx
  ON bookings (user_id, created_at DESC);

INSERT INTO countries (name)
VALUES
('Italy'),
('Japan'),
('France'),
('Greece'),
('Spain'),
('Turkey'),
('United States'),
('United Kingdom'),
('Brazil'),
('Kyrgyzstan'),
('Thailand'),
('Indonesia'),
('United Arab Emirates'),
('Maldives'),
('Switzerland'),
('Portugal'),
('Germany'),
('Netherlands'),
('Austria'),
('Croatia'),
('Egypt'),
('Morocco'),
('Mexico'),
('Canada'),
('Australia'),
('South Korea'),
('China'),
('Singapore'),
('Vietnam'),
('India');