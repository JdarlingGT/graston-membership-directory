-- Graston Membership Directory Schema
-- Based on WordPress ACF fields

CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wordpress_id INTEGER UNIQUE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    
    -- Certification and Training
    certification_level TEXT CHECK (certification_level IN ('GT1', 'GT2', 'GT3', 'ADVANCED', 'PREFERRED', 'PREMIER')) DEFAULT 'GT1',
    certification_date DATE,
    certification_expiry DATE,
    training_level TEXT CHECK (training_level IN ('ESSENTIAL', 'ADVANCED', 'GTS_CERTIFIED')) DEFAULT 'ESSENTIAL',
    
    -- Practice Information
    practice_name TEXT,
    practice_website TEXT,
    phone_number TEXT,
    
    -- Address Information
    street_address TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'United States',
    latitude REAL,
    longitude REAL,
    
    -- Professional Information
    license_number TEXT,
    profession TEXT,
    specialties TEXT, -- JSON array
    years_experience INTEGER,
    education TEXT,
    bio TEXT,
    
    -- Profile Settings
    profile_image TEXT, -- URL to image
    show_in_directory BOOLEAN DEFAULT 1,
    allow_public_contact BOOLEAN DEFAULT 1,
    
    -- Membership Information
    membership_status TEXT CHECK (membership_status IN ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED')) DEFAULT 'ACTIVE',
    membership_tier TEXT CHECK (membership_tier IN ('BASIC', 'PROFESSIONAL', 'PREMIUM')) DEFAULT 'BASIC',
    join_date DATE DEFAULT (DATE('now')),
    last_updated DATETIME DEFAULT (DATETIME('now')),
    
    created_at DATETIME DEFAULT (DATETIME('now')),
    updated_at DATETIME DEFAULT (DATETIME('now'))
);

-- Accreditations table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS accreditations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    badge_image TEXT, -- URL to badge image
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT (DATETIME('now'))
);

-- Provider Accreditations junction table
CREATE TABLE IF NOT EXISTS provider_accreditations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    accreditation_id INTEGER NOT NULL,
    earned_date DATE,
    expiry_date DATE,
    certificate_number TEXT,
    created_at DATETIME DEFAULT (DATETIME('now')),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (accreditation_id) REFERENCES accreditations(id) ON DELETE CASCADE,
    UNIQUE(provider_id, accreditation_id)
);

-- Continuing Education Courses
CREATE TABLE IF NOT EXISTS ce_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    course_name TEXT NOT NULL,
    course_provider TEXT,
    completion_date DATE,
    hours INTEGER,
    certificate_url TEXT,
    created_at DATETIME DEFAULT (DATETIME('now')),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- Contact Inquiries (from public contact form)
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    inquirer_name TEXT NOT NULL,
    inquirer_email TEXT NOT NULL,
    inquirer_phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('NEW', 'READ', 'RESPONDED', 'ARCHIVED')) DEFAULT 'NEW',
    created_at DATETIME DEFAULT (DATETIME('now')),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- Sync tracking for WordPress integration
CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL, -- 'provider', 'accreditation', etc.
    entity_id INTEGER NOT NULL,
    wordpress_id INTEGER,
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    status TEXT CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')) DEFAULT 'PENDING',
    error_message TEXT,
    created_at DATETIME DEFAULT (DATETIME('now'))
);

-- Insert default accreditations
INSERT OR IGNORE INTO accreditations (name, description, badge_image, display_order) VALUES
('Essential Trained Level', 'Basic Graston Technique training certification', '/images/Essential-Trainied-Level-Badge.svg', 1),
('Advanced Trained', 'Advanced level Graston Technique certification', '/images/Graston-Advanced-Trained-Badge.svg', 2),
('GTS Certified', 'Graston Technique Specialist certification', '/images/GTS-Certified-Badge.svg', 3),
('Preferred Provider', 'Preferred provider status', '/images/PreferredBadge_01.webp', 4),
('Premier Provider', 'Premier provider status', '/images/PremierBadge_01-04.webp', 5);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_providers_email ON providers(email);
CREATE INDEX IF NOT EXISTS idx_providers_location ON providers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_providers_certification ON providers(certification_level);
CREATE INDEX IF NOT EXISTS idx_providers_membership ON providers(membership_status, membership_tier);
CREATE INDEX IF NOT EXISTS idx_providers_directory ON providers(show_in_directory, membership_status);
CREATE INDEX IF NOT EXISTS idx_provider_accreditations_provider ON provider_accreditations(provider_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_provider ON contact_inquiries(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_sync_log_entity ON sync_log(entity_type, entity_id);
