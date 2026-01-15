import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private usersService: UsersService) {}

  async onModuleInit() {
    // Create manager user on startup if not exists
    await this.usersService.createManagerIfNotExists();
  }

  getHello(): string {
    return 'Smart Student Management System API - Managed by Yaniv Raz';
  }
}
