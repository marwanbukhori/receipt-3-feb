import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class PremiumGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.user.subscription === 'premium';
  }
}
