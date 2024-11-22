import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { UserService } from './user.service';
import { ResponseData } from 'src/global/globalClass';
import { BookService } from 'src/book/book.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
// import { GetUser } from './decorators';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<ResponseData> {
    try {
      const book = await this.bookService.findAll(null, null, null, null)
      console.log(book)
      const user = await this.userService.findById(id);
      return new ResponseData(
        user,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      console.log(error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }
  // async getUser(@GetUser() user: User) {
  //   console.log(user);
  // }
}
