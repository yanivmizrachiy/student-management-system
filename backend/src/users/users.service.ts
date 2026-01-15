import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async createManagerIfNotExists(): Promise<User> {
    const managerEmail = process.env.MANAGER_EMAIL || 'yaniv@example.com';
    const managerPassword = process.env.MANAGER_PASSWORD || 'change-me';
    
    let manager = await this.findByEmail(managerEmail);
    
    if (!manager) {
      manager = await this.create({
        email: managerEmail,
        password: managerPassword,
        name: 'Yaniv Raz',
        role: UserRole.MANAGER,
        isActive: true,
      });
      console.log('✅ Manager user created:', managerEmail);
    }
    
    return manager;
  }
}
