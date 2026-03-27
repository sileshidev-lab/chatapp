CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       auth_user_id VARCHAR(100) NOT NULL UNIQUE,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       display_name VARCHAR(100) NOT NULL,
                       avatar_url VARCHAR(512),
                       created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
