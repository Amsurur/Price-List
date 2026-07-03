import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  private async validateAdmin(email: string, password: string) {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    const passwordHash = this.config.get<string>('ADMIN_PASSWORD_HASH');
    if (!adminEmail || !passwordHash) {
      throw new InternalServerErrorException(
        'Admin login is not configured (ADMIN_EMAIL / ADMIN_PASSWORD_HASH)',
      );
    }
    if (email !== adminEmail) return false;
    return bcrypt.compare(password, passwordHash);
  }

  // Returns a signed token on success, or null on bad credentials — the
  // controller turns that into the 401 so this stays a plain data method.
  async login(email: string, password: string): Promise<string | null> {
    const valid = await this.validateAdmin(email, password);
    if (!valid) return null;
    return this.jwt.signAsync({ sub: email });
  }
}
