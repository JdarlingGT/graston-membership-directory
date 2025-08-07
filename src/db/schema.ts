import { sql, relations } from 'drizzle-orm';
import { 
  sqliteTable, 
  integer, 
  text, 
  real,
  primaryKey
} from 'drizzle-orm/sqlite-core';

// Providers table
export const providers = sqliteTable('providers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  wordpressId: integer('wordpress_id').unique(),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  
  // Certification and Training
  certificationLevel: text('certification_level', { 
    enum: ['GT1', 'GT2', 'GT3', 'ADVANCED', 'PREFERRED', 'PREMIER'] 
  }).default('GT1'),
  certificationDate: text('certification_date'), // DATE as TEXT in SQLite
  certificationExpiry: text('certification_expiry'),
  trainingLevel: text('training_level', {
    enum: ['ESSENTIAL', 'ADVANCED', 'GTS_CERTIFIED']
  }).default('ESSENTIAL'),
  
  // Practice Information
  practiceName: text('practice_name'),
  practiceWebsite: text('practice_website'),
  phoneNumber: text('phone_number'),
  
  // Address Information
  streetAddress: text('street_address'),
  city: text('city'),
  stateProvince: text('state_province'),
  postalCode: text('postal_code'),
  country: text('country').default('United States'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  
  // Professional Information
  licenseNumber: text('license_number'),
  profession: text('profession'),
  specialties: text('specialties'), // JSON array as TEXT
  yearsExperience: integer('years_experience'),
  education: text('education'),
  bio: text('bio'),
  
  // Profile Settings
  profileImage: text('profile_image'),
  showInDirectory: integer('show_in_directory', { mode: 'boolean' }).default(true),
  allowPublicContact: integer('allow_public_contact', { mode: 'boolean' }).default(true),
  
  // Membership Information
  membershipStatus: text('membership_status', {
    enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']
  }).default('ACTIVE'),
  membershipTier: text('membership_tier', {
    enum: ['BASIC', 'PROFESSIONAL', 'PREMIUM']
  }).default('BASIC'),
  joinDate: text('join_date').default(sql`(DATE('now'))`),
  lastUpdated: text('last_updated').default(sql`(DATETIME('now'))`),
  
  createdAt: text('created_at').default(sql`(DATETIME('now'))`),
  updatedAt: text('updated_at').default(sql`(DATETIME('now'))`)
});

// Accreditations table
export const accreditations = sqliteTable('accreditations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  badgeImage: text('badge_image'),
  displayOrder: integer('display_order').default(0),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`(DATETIME('now'))`)
});

// Provider Accreditations junction table
export const providerAccreditations = sqliteTable('provider_accreditations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  providerId: integer('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
  accreditationId: integer('accreditation_id').notNull().references(() => accreditations.id, { onDelete: 'cascade' }),
  earnedDate: text('earned_date'),
  expiryDate: text('expiry_date'),
  certificateNumber: text('certificate_number'),
  createdAt: text('created_at').default(sql`(DATETIME('now'))`)
});

// Continuing Education Courses
export const ceCourses = sqliteTable('ce_courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  providerId: integer('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
  courseName: text('course_name').notNull(),
  courseProvider: text('course_provider'),
  completionDate: text('completion_date'),
  hours: integer('hours'),
  certificateUrl: text('certificate_url'),
  createdAt: text('created_at').default(sql`(DATETIME('now'))`)
});

// Contact Inquiries
export const contactInquiries = sqliteTable('contact_inquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  providerId: integer('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
  inquirerName: text('inquirer_name').notNull(),
  inquirerEmail: text('inquirer_email').notNull(),
  inquirerPhone: text('inquirer_phone'),
  subject: text('subject'),
  message: text('message').notNull(),
  status: text('status', { enum: ['NEW', 'READ', 'RESPONDED', 'ARCHIVED'] }).default('NEW'),
  createdAt: text('created_at').default(sql`(DATETIME('now'))`)
});

// Sync tracking
export const syncLog = sqliteTable('sync_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  wordpressId: integer('wordpress_id'),
  action: text('action').notNull(),
  status: text('status', { enum: ['SUCCESS', 'FAILED', 'PENDING'] }).default('PENDING'),
  errorMessage: text('error_message'),
  createdAt: text('created_at').default(sql`(DATETIME('now'))`)
});

// Relations
export const providersRelations = relations(providers, ({ many }) => ({
  accreditations: many(providerAccreditations),
  courses: many(ceCourses),
  inquiries: many(contactInquiries)
}));

export const accreditationsRelations = relations(accreditations, ({ many }) => ({
  providers: many(providerAccreditations)
}));

export const providerAccreditationsRelations = relations(providerAccreditations, ({ one }) => ({
  provider: one(providers, {
    fields: [providerAccreditations.providerId],
    references: [providers.id]
  }),
  accreditation: one(accreditations, {
    fields: [providerAccreditations.accreditationId],
    references: [accreditations.id]
  })
}));

// Type exports
export type Provider = typeof providers.$inferSelect;
export type NewProvider = typeof providers.$inferInsert;
export type Accreditation = typeof accreditations.$inferSelect;
export type ProviderAccreditation = typeof providerAccreditations.$inferSelect;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
