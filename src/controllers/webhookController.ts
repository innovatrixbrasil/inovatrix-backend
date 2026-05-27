import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class WebhookController {
  // Verificacao do webhook pela Meta
  async verify(req: Request, res: Response): Promise<void> {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      console.log('Webhook verificado com sucesso');
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ error: 'Token de verificacao invalido' });
    }
  }

  // Recebimento de mensagens via webhook
  async receive(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;

      if (body.object !== 'whatsapp_business_account') {
        res.status(404).json({ error: 'Objeto nao reconhecido' });
        return;
      }

      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          const value = change.value;

          if (!value) continue;

          // Busca o tenant pelo phone_number_id
          const phoneNumberId = value.metadata?.phone_number_id;
          if (!phoneNumberId) continue;

          const tenant = await prisma.tenant.findFirst({
            where: { phoneNumberId },
          });

          if (!tenant) continue;

          // Processa mensagens recebidas
          const messages = value.messages || [];
          for (const message of messages) {
            await prisma.message.create({
              data: {
                tenantId: tenant.id,
                whatsappId: message.id,
                from: message.from,
                type: message.type,
                content: JSON.stringify(message),
                timestamp: new Date(parseInt(message.timestamp) * 1000),
              },
            });
          }
        }
      }

      res.status(200).json({ status: 'received' });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
