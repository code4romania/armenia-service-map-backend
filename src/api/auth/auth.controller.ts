import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../modules/auth/auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { PasswordSetupDto } from './dto/password-setup.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtPayload } from '../../common/interfaces/authenticated-request.interface.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@CurrentUser() user: JwtPayload & { refreshToken: string }) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('sub') userId: string) {
    await this.authService.logout(userId);
    return { message: 'Logged out' };
  }

  @Get('me')
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Public()
  @Post('password-setup')
  @HttpCode(HttpStatus.OK)
  async passwordSetup(@Body() dto: PasswordSetupDto) {
    await this.authService.setupPassword(dto.token, dto.password);
    return { message: 'Password set successfully' };
  }
}
