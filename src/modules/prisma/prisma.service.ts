// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Optional: Custom error handling method
  async executeQuery<T>(query: () => Promise<T>): Promise<T> {
    try {
      return await query();
    } catch (error) {
      console.error('Prisma Query Error:', error);
      throw error;
    }
  }
}
