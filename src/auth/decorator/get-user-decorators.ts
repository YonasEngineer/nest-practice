import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'generated/prisma'; // Your Prisma User type

// Custom Request interface
interface AuthRequest extends Request {
  user?: User; // Explicitly type user as User or undefined
}

export const GetUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const request: AuthRequest = ctx.switchToHttp().getRequest();
    if (data && request.user) {
      return request.user[data];
    }
    return request.user;
  },
);
