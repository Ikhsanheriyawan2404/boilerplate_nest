import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenTypes } from './types/TokenTypes';
import { PrismaService } from 'src/common/prisma.service';


@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService
  ) {}

  async generateToken(user: any, type: string, secret: string, expiresIn: string) {
    const payload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      type,
    };
    return this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: expiresIn
    });
  }

  generateAuthTokens = async (user: any) => {
    const now = new Date();

    const accessTokenExpires = new Date(now.getTime() + parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES) * 60_000);
    const accessToken = await this.generateToken(user, TokenTypes.ACCESS, process.env.JWT_ACCESS_SECRET.toString(), process.env.JWT_ACCESS_EXPIRATION_MINUTES + 'm');

    const refreshToken = await this.generateToken(user, TokenTypes.REFRESH, process.env.JWT_REFRESH_SECRET.toString(), process.env.JWT_REFRESH_EXPIRATION_DAYS + 'd');
    const refreshTokenExpires = new Date(now.getTime() + parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000);
    // const refreshTokenExpires = new Date(now.getTime() + parseInt(process.env.JWT_REFRESH_EXPIRATION_MINUTES) * 60_000);

    await this.saveToken(refreshToken, user.id, refreshTokenExpires, TokenTypes.REFRESH);

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
        token: refreshToken,
        expires: refreshTokenExpires
      },
    };
  };

  async saveToken(token: string, userId: number, expires: Date, type: string, blacklisted = false) {
    return await this.prismaService.$transaction(async (prisma) => {
      await prisma.tokens.deleteMany({
        where: {
          user_id: userId,
          type: type
        }
      });
      return prisma.tokens.create({
        data: {
          token,
          user_id: userId,
          expires,
          type,
          blacklisted,
        },
        select: {
          id: true,
          token: true
        }
      });
    });
  };

  verifyToken = async (token: string, type: string) => {
    const payload = this.jwtService.verify(token, {
      secret: type == TokenTypes.REFRESH ? process.env.JWT_REFRESH_SECRET : process.env.JWT_ACCESS_SECRET
    });

    const tokenDoc = await this.prismaService.tokens.findFirst({
      where: {
        user_id: payload.userId,
        token,
        type,
        blacklisted: false
      }
    });

    if (!tokenDoc) {
      throw new NotFoundException('Token not found');
    }
    return tokenDoc;
  };

  deleteToken(userId: number) {
    return this.prismaService.tokens.deleteMany({
      where: {
        user_id: userId,
        type: TokenTypes.REFRESH,
        blacklisted: false
      }
    });
  }
}
