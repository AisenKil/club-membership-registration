CREATE DATABASE IF NOT EXISTS club_membership
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE club_membership;

CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  student_id VARCHAR(50) NULL,
  club VARCHAR(80) NOT NULL,
  membership_type ENUM('General Member', 'Volunteer', 'Committee Member') NOT NULL,
  interests VARCHAR(1000) NULL,
  reason TEXT NULL,
  agree_to_rules TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_members_club (club),
  INDEX idx_members_created_at (created_at)
) ENGINE=InnoDB;

INSERT INTO members
  (full_name, email, phone, student_id, club, membership_type, interests, reason, agree_to_rules)
VALUES
  ('Mika Reyes', 'mika.reyes@example.com', '+63 917 555 0134', '2026-00128', 'Technology & Innovation', 'General Member', 'Web development, UI design', 'I want to build practical projects with other students.', 1),
  ('Daniel Cruz', 'daniel.cruz@example.com', '+63 905 555 0271', '2026-00462', 'Community Service', 'Volunteer', 'Community outreach, event planning', 'I would like to take part in local volunteer activities.', 1),
  ('Sofia Lim', 'sofia.lim@example.com', '+63 926 555 0188', '2026-00875', 'Arts & Design', 'Committee Member', 'Illustration, photography', 'I hope to help organize creative campus events.', 1)
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  phone = VALUES(phone),
  club = VALUES(club),
  membership_type = VALUES(membership_type);
