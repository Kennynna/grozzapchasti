import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AdminTokenPayload } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  me(@Req() request: { admin: AdminTokenPayload }) {
    return this.authService.me(request.admin.sub);
  }
}
