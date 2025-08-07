import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createDatabase, providers, accreditations, contactInquiries } from './db';
import { eq, and } from 'drizzle-orm';

// Define the Cloudflare Worker environment bindings
type Bindings = {
  DB: D1Database;
  KV_KEYVALUE: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['https://dazzling-tiger-zoom.pages.dev', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Graston Membership Directory API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
const api = new Hono<{ Bindings: Bindings }>();

// GET /api/providers - List all providers
api.get('/providers', async (c) => {
  const db = createDatabase(c.env.DB);
  
  try {
    const allProviders = await db
      .select()
      .from(providers)
      .where(and(
        eq(providers.showInDirectory, true),
        eq(providers.membershipStatus, 'ACTIVE')
      ));
    
    return c.json({ success: true, data: allProviders });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return c.json({ success: false, error: 'Failed to fetch providers' }, 500);
  }
});

// GET /api/providers/:id - Get specific provider
api.get('/providers/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const db = createDatabase(c.env.DB);
  
  try {
    const provider = await db
      .select()
      .from(providers)
      .where(eq(providers.id, id))
      .limit(1);
    
    if (provider.length === 0) {
      return c.json({ success: false, error: 'Provider not found' }, 404);
    }
    
    return c.json({ success: true, data: provider[0] });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return c.json({ success: false, error: 'Failed to fetch provider' }, 500);
  }
});

// POST /api/contact - Submit contact inquiry
api.post('/contact', async (c) => {
  const db = createDatabase(c.env.DB);
  
  try {
    const body = await c.req.json();
    const { providerId, inquirerName, inquirerEmail, inquirerPhone, subject, message } = body;
    
    // Validate required fields
    if (!providerId || !inquirerName || !inquirerEmail || !message) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: providerId, inquirerName, inquirerEmail, message' 
      }, 400);
    }
    
    // Insert contact inquiry
    const result = await db.insert(contactInquiries).values({
      providerId: parseInt(providerId),
      inquirerName,
      inquirerEmail,
      inquirerPhone,
      subject,
      message
    }).returning();
    
    return c.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error creating contact inquiry:', error);
    return c.json({ success: false, error: 'Failed to submit contact inquiry' }, 500);
  }
});

// GET /api/accreditations - List all accreditations
api.get('/accreditations', async (c) => {
  const db = createDatabase(c.env.DB);
  
  try {
    const allAccreditations = await db
      .select()
      .from(accreditations)
      .where(eq(accreditations.active, true))
      .orderBy(accreditations.displayOrder);
    
    return c.json({ success: true, data: allAccreditations });
  } catch (error) {
    console.error('Error fetching accreditations:', error);
    return c.json({ success: false, error: 'Failed to fetch accreditations' }, 500);
  }
});

// WordPress sync webhook endpoint
api.post('/sync/wordpress', async (c) => {
  const db = createDatabase(c.env.DB);
  
  try {
    const body = await c.req.json();
    console.log('WordPress sync webhook received:', body);
    
    // TODO: Implement WordPress data sync logic
    // This will receive webhooks from WordPress when provider data changes
    
    return c.json({ success: true, message: 'Sync initiated' });
  } catch (error) {
    console.error('Error in WordPress sync:', error);
    return c.json({ success: false, error: 'Sync failed' }, 500);
  }
});

// Mount API routes
app.route('/api', api);

// Scheduled task for periodic WordPress sync
export async function scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext): Promise<void> {
  console.log('Running scheduled WordPress sync');
  // TODO: Implement scheduled sync logic
}

export default app;
