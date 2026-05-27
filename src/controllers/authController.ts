import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, companyName, phone } = req.body;

      if (!name || !email || !password || !companyName) {
        res.status(400).json({ error: 'Campos obrigatorios: name, email, password, companyName' });
        return;
      }

      const existingTenant = await prisma.tenant.findUnique({ where: { email } });
      if (existingTenant) {
        res.status(409).json({ error: 'Email ja cadastrado' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const tenant = await prisma.tenant.create({
        data: {
          name,
          email,
          password: hashedPassword,
          companyName,
          phone: phone || null,
        },
      });

      const token = jwt.sign(
        { tenantId: tenant.id, email: tenant.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
      );

      res.status(201).json({
        message: 'Tenant cadastrado com sucesso',
        token,
        tenant: { id: tenant.id, name: tenant.name, email: tenant.email, companyName: tenant.companyName },
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const tenant = await prisma.tenant.findUnique({ where: { email } });
      if (!tenant) {
        res.status(401).json({ error: 'Credenciais invalidas' });
        return;
      }

      const isValid = await bcrypt.compare(password, tenant.password);
      if (!isValid) {
        res.status(401).json({ error: 'Credenciais invalidas' });
        return;
      }

      const token = jwt.sign(
        { tenantId: tenant.id, email: tenant.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
      );

      res.json({ token, tenant: { id: tenant.id, name: tenant.name, email: tenant.email } });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
