import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.tenantId;

    // Rotas públicas (sem user) podem ter tenant do middleware
    if (!user) {
      return true;
    }

    // SUPER_ADMIN pode acessar qualquer tenant
    if (user.role === 'SUPER_ADMIN') {
      // Se não tem tenantId no request, usa o do header/param
      // SUPER_ADMIN pode operar sem tenant em rotas globais
      return true;
    }

    // Usuário autenticado deve ter tenant
    if (!tenantId) {
      throw new ForbiddenException('Tenant não identificado');
    }

    // Tenant do usuário deve coincidir com o tenant da requisição
    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('Acesso negado: tenant inválido');
    }

    return true;
  }
}
