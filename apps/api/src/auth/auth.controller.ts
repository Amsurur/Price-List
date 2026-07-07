import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ADMIN_COOKIE_NAME, adminCookieOptions } from './auth.constants';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.auth.login(dto.email, dto.password);
    if (!token) {
      throw new UnauthorizedException('Неверная почта или пароль');
    }
    res.cookie(ADMIN_COOKIE_NAME, token, adminCookieOptions());
    return { email: dto.email };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ADMIN_COOKIE_NAME, adminCookieOptions());
    return { success: true };
  }

  // Lets the admin UI confirm the cookie is actually still valid, not just present.
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: { email: string } }) {
    return { email: req.user.email };
  }
}
