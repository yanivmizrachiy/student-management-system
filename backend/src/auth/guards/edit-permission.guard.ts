import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class EditPermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    
    // Only Manager (Yaniv) can edit
    if (user.role !== UserRole.MANAGER) {
      throw new ForbiddenException(
        'Only managers have edit permissions. You have read-only access.',
      );
    }
    return true;
  }
}

