-- Job Application Portal - Normalized MySQL Schema

CREATE DATABASE IF NOT EXISTS job_portal;
USE job_portal;

-- Users table: candidates and recruiters
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('candidate', 'recruiter') NOT NULL DEFAULT 'candidate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies (owned by recruiters)
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recruiter_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Jobs posted by recruiters
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  posted_by INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(120),
  job_type ENUM('full-time','part-time','internship','contract') DEFAULT 'full-time',
  salary_min INT,
  salary_max INT,
  status ENUM('open','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_jobs_title (title),
  INDEX idx_jobs_location (location)
);

-- Candidate profiles (1-1 with users where role = candidate)
CREATE TABLE candidate_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  resume_url VARCHAR(255),
  skills VARCHAR(500),
  experience_years INT DEFAULT 0,
  phone VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Applications: many-to-many between candidates and jobs, with status tracking
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  candidate_id INT NOT NULL,
  cover_letter TEXT,
  status ENUM('applied','under_review','shortlisted','rejected','hired') DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (job_id, candidate_id),
  INDEX idx_applications_status (status)
);
