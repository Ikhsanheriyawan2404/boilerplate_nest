import {
    Controller,
    Post,
    UseGuards,
    Get,
    Req,
    Inject,
    HttpCode
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { TokenService } from 'src/token/token.service';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Public } from './decorators/public.decorator';
import { TokenTypes } from 'src/token/types/TokenTypes';

@Controller('auth')
export class AuthController {

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  @Public()
  @Get('test')
  @HttpCode(200)
  test(): {message: string} {
    return {
      message: "Hello World Test"
    };
  }

  @UseGuards(ThrottlerGuard)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  login(@Req() req: Request) {
    return this.tokenService.generateAuthTokens(req.user);
  }

  // @UseGuards(ThrottlerGuard)
  // @SkipThrottle({ default: false })
  // @Get('test')
  // test(@Req() req: Request) {
  //   this.logger.info('TEST TEST GUYS')
  //   return this.authService.getUser()
  // }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request) {
    const userId = req.user['userId'];
    const refreshToken = req.user['refreshToken'];

    console.log(userId)
    console.log(refreshToken)

    await this.tokenService.verifyToken(refreshToken, TokenTypes.REFRESH);
    await this.authService.logout(userId);

    return {
      message: "Berhasil logout",
      data: null
    }
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @HttpCode(200)
  refreshTokens(@Req() req: Request) {
    const userId = req.user['userId'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('profile')
  @HttpCode(200)
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
