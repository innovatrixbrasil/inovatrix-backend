import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { MetaController } from '../controllers/metaController';
import { WebhookController } from '../controllers/webhookController';

export const router = Router();

const authController = new AuthController();
const metaController = new MetaController();
const webhookController = new WebhookController();

// Auth routes
router.post('/auth/register', authController.register.bind(authController));
router.post('/auth/login', authController.login.bind(authController));

// Meta / WhatsApp routes
router.post('/meta/callback', metaController.callback.bind(metaController));
router.get('/meta/status', metaController.status.bind(metaController));

// Webhook routes
router.get('/webhook', webhookController.verify.bind(webhookController));
router.post('/webhook', webhookController.receive.bind(webhookController));
