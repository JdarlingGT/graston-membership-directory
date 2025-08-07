-- Insert sample provider data for testing
INSERT INTO providers (
  email, first_name, last_name, certification_level, training_level,
  practice_name, phone_number, street_address, city, state_province, 
  postal_code, latitude, longitude, profession, specialties, bio,
  show_in_directory, membership_status, membership_tier
) VALUES 
(
  'john.smith@example.com', 'John', 'Smith', 'ADVANCED', 'ADVANCED',
  'Smith Physical Therapy', '(555) 123-4567', '123 Main St', 'Springfield', 'IL',
  '62701', 39.7817, -89.6501, 'Physical Therapist', 
  '["Sports Medicine", "Orthopedics"]',
  'Experienced physical therapist specializing in sports medicine and Graston Technique.',
  1, 'ACTIVE', 'PROFESSIONAL'
),
(
  'sarah.jones@example.com', 'Sarah', 'Jones', 'PREMIER', 'GTS_CERTIFIED',
  'Jones Rehabilitation Center', '(555) 987-6543', '456 Oak Ave', 'Chicago', 'IL',
  '60601', 41.8781, -87.6298, 'Chiropractor',
  '["Manual Therapy", "Sports Rehabilitation"]',
  'Premier provider with GTS certification and 15+ years experience.',
  1, 'ACTIVE', 'PREMIUM'
),
(
  'mike.wilson@example.com', 'Mike', 'Wilson', 'GT2', 'ESSENTIAL',
  'Wilson Sports Clinic', '(555) 456-7890', '789 Pine St', 'Milwaukee', 'WI',
  '53202', 43.0389, -87.9065, 'Athletic Trainer',
  '["Sports Medicine", "Injury Prevention"]',
  'Athletic trainer focused on injury prevention and recovery using Graston Technique.',
  1, 'ACTIVE', 'BASIC'
);

-- Insert provider accreditations
INSERT INTO provider_accreditations (provider_id, accreditation_id, earned_date) VALUES
(1, 2, '2023-06-15'), -- John Smith - Advanced Trained
(2, 3, '2022-03-20'), -- Sarah Jones - GTS Certified
(2, 5, '2023-01-10'), -- Sarah Jones - Premier Provider
(3, 1, '2024-01-20'); -- Mike Wilson - Essential Trained Level
