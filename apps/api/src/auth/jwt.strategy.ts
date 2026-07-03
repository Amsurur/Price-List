import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { ADMIN_COOKIE_NAME } from './auth.constants';

function cookieExtractor(req: Request): string | null {
  return (req?.cookies?.[ADMIN_COOKIE_NAME] as string | undefined) ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: config.get<string>('JWT_SECRET') ?? '',
    });
  }

  // Runs after signature/expiry checks pass; becomes req.user.
  validate(payload: { sub: string }) {
    return { email: payload.sub };
  }
}
