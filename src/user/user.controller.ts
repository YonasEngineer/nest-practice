import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from 'generated/prisma';
import { GetUser } from 'src/auth/decorator/get-user-decorators';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard) // Here the guard is at  controller label not route label
@Controller('users') // if there is no users or no pass parameter to the controller the default is home page request
export class UserController {
  @Get('me')
  // getme(@GetUser() user: User, @GetUser('email') email: string) {
  getme(@GetUser() user: User) {
    // console.log('email', email);
    // getme(@Req() req: Request) {
    return user;
  }

  @Patch()
  editUser() {}
}
