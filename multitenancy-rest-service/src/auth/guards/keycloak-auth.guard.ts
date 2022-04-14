import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { PublicKeyCache } from '../cache.publicKey';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(
    private readonly authenticationService: AuthService,
    private publicKeyCache: PublicKeyCache,
    private reflector: Reflector,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request: Request = context.switchToHttp().getRequest();
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const header = request.header('Authorization');
    if (!header) {
      throw new HttpException(
        'Authorization: Bearer <token> header missing',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new HttpException(
        'Authorization: Bearer <token> header invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = parts[1];
    try {
      const publicKey = await this.publicKeyCache.getPublicKey(token);
      await this.authenticationService.validateTokenwithKey(token, publicKey);
      const userRoles: string[] = await this.authenticationService.getRoles(token);
      const usrRole = await this.hasRole(userRoles, roles);
      return usrRole;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.UNAUTHORIZED);
    }
  }

  async hasRole(userRoles: string[], roles: string[]): Promise<boolean> {
    const containsAll: boolean = roles.some(role => {
      return userRoles.includes(role);
    })
    return containsAll;
  }

}