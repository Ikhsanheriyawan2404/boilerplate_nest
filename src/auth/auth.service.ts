import { ForbiddenException, BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/token/token.service';
import { TokenTypes } from 'src/token/types/TokenTypes';
import { UsersService } from 'src/users/users.service';

export type User = any;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    // disinilah letak kelamaan prosesnya
    // dan itu adalah hal normal
    if (!user || !await bcrypt.compare(password, user.password.replace("$2y$", "$2a$"))) {
      throw new BadRequestException('Invalid email or password');
    }

    return user;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    const token = await this.tokenService.verifyToken(refreshToken, TokenTypes.REFRESH);

    if (!user || !token)
      throw new ForbiddenException('Access Denied');

    const now = new Date();

    const accessTokenExpires = new Date(now.getTime() + parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES) * 60_000);
    const accessToken = await this.tokenService.generateToken(user, TokenTypes.ACCESS, process.env.JWT_ACCESS_SECRET.toString(), process.env.JWT_ACCESS_EXPIRATION_MINUTES + 'm');

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
      access: {
        token: accessToken,
        expires: accessTokenExpires
      },
      refresh: {
        token: token.token,
        expires: token.expires
      },
    }
  }

  logout = (userId: number) => {
    return this.tokenService.deleteToken(userId);
  };
}
