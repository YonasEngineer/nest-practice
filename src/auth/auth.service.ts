import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable() // this Injectable accept other object
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    //Let's use argon for password hash
    //generate the password hash
    try {
      const hash = await argon.hash(dto.password);
      //Save the new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      return { user };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // P2002 stands for deplicate field
          throw new ForbiddenException('credentuial taken');
        }
      }
      throw new Error('An unexpected error occurred during signup');
    }
  }

  async signin(dto: AuthDto) {
    //find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    //if the  user doesn't exist throw exeception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }
    //compare password
    const pwMathces = await argon.verify(user.hash, dto.password);
    //if password incorrect throw exception
    if (!pwMathces) {
      throw new ForbiddenException('Credentials incorrect');
    }
    //if everything good return user
    return { access_token: await this.signToken(user.id, user.email) };
  }

  async signToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET') as string;
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return access_token;
  }
}
