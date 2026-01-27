CREATE DATABASE IF NOT EXISTS messenger;
USE messenger;

CREATE TABLE IF NOT EXISTS users (
  user_id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS channels (
  channel_id CHAR(36) PRIMARY KEY,
  user_limit INT,
  category VARCHAR(20),
  channel_name VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  message_id CHAR(36) PRIMARY KEY,
  channels_fk CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  content VARCHAR(2000) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_channel_time (channel_id, created_at),
  FOREIGN KEY (channels_fk) REFERENCES channels(user_id) ON DELETE CASCADE,
  FOREIGN KEY (users_fk) REFERENCES users(channel_id) ON DELETE CASCADE
);
