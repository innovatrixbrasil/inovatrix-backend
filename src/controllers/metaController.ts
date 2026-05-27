import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../config/database';

export class MetaController {
  async callback(req: Request, res: Response): Promise<void> {
    try {
      const { code, tenantId } = req.body;

      if (!code || !tenantId) {
        res.status(400).json({ error: 'code e tenantId sao obrigatorios' });
        return;
      }

      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) {
        res.status(404).json({ error: 'Tenant nao encontrado' });
        return;
      }

      // Troca o code pelo access_token na Meta Graph API
      const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: `${process.env.FRONTEND_URL}/meta/callback`,
          code,
        },
      });

      const { access_token } = tokenResponse.data;

      // Busca informacoes do WABA
      const wabaResponse = await axios.get('https://graph.facebook.com/v18.0/me/businesses', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const wabaId = wabaResponse.data?.data?.[0]?.id || null;

      // Atualiza tenant com dados da Meta
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          metaAccessToken: access_token,
          wabaId: wabaId,
          isActive: true,
        },
      });

      res.json({ message: 'Integracao Meta realizada com sucesso', wabaId });
    } catch (error: any) {
      console.error('Erro no callback Meta:', error?.response?.data || error);
      res.status(500).json({ error: 'Erro ao processar callback da Meta' });
    }
  }

  async status(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.query;

      if (!tenantId) {
        res.status(400).json({ error: 'tenantId e obrigatorio' });
        return;
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: String(tenantId) },
        select: { id: true, name: true, isActive: true, wabaId: true, phoneNumberId: true },
      });

      if (!tenant) {
        res.status(404).json({ error: 'Tenant nao encontrado' });
        return;
      }

      res.json({ tenant });
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
