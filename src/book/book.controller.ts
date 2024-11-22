import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { CreateBookDTO } from './dto/create-book.dto';
import { UpdateBookDTO } from './dto/update-book.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  @Roles(Role.Admin)
  async getAllBooks(
    @Query() query: any,
    @Req() request: Request,
  ): Promise<ResponseData> {
    try {
      const { keyword, index, sortKey, sortValue } = query;
      const books = await this.bookService.findAll(
        keyword,
        index,
        sortKey,
        sortValue,
      );
      return new ResponseData(books, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.log(error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }

  @Get(':id')
  async getBook(@Param('id') id: string): Promise<ResponseData> {
    // try {
    const book = await this.bookService.findByID(id);
    return new ResponseData(book, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    // } catch (error) {
    //   return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    // }
  }

  @Post()
  async createBook(@Body() book: CreateBookDTO): Promise<ResponseData> {
    try {
      const newBook = await this.bookService.create(book);
      return new ResponseData(newBook, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.log(error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }

  @Patch(':id')
  async updateBook(
    @Param('id') id: string,
    @Body() book: UpdateBookDTO,
  ): Promise<ResponseData> {
    try {
      const updatedBook = await this.bookService.update(id, book);
      return new ResponseData(
        updatedBook,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }

  @Patch(':id')
  async deleteBook(@Param('id') id: string): Promise<ResponseData> {
    try {
      const deleteBook = await this.bookService.delete(id);
      return new ResponseData(
        deleteBook,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }
}
