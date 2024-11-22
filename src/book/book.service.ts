import mongoose from 'mongoose';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import { CreateBookDTO } from './dto/create-book.dto';
import { UpdateBookDTO } from './dto/update-book.dto';
import convertToSlug from 'src/helpers/convertToSlug.helper';
import PaginationHelper from 'src/helpers/pagination.helper';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name)
    private bookModel: mongoose.Model<Book>,
  ) {}

  async findAll(
    keyword: string,
    index: string,
    sortKey: string,
    sortValue: string,
  ): Promise<Book[]> {
    let books = [];

    interface BookQuery {
      $or: Array<{
        title?: RegExp;
        slug?: RegExp;
      }>;
      isDeleted: boolean;
    }

    const query: BookQuery = {
      $or: [],
      isDeleted: false,
    };

    if (keyword) {
      const regexKeyword: RegExp = new RegExp(keyword, 'i');
      const generateSlug = convertToSlug(keyword);
      const regexSlug = new RegExp(generateSlug, 'i');

      query.$or.push({ title: regexKeyword, slug: regexSlug });
    }

    let sort = {};
    if (sortKey && sortValue) {
      sort[sortKey] = sortValue;
    } else {
      sort['title'] = 'asc';
    }

    const totalBooks = await this.bookModel.countDocuments({
      isDeleted: false,
    });
    const pagination = PaginationHelper(index, totalBooks);
    console.log(pagination);

    // console.log(query);

    books = await this.bookModel
      .find(query)
      .sort(sort)
      .limit(pagination.limitItems)
      .skip(pagination.startItem);

    return books;
  }

  async findByID(id: string): Promise<Book> {

    const isValidID = mongoose.isValidObjectId(id)
    if(!isValidID) {
      throw new BadRequestException("ID is not acceptable")
    }
    const book = await this.bookModel.findById(id);
    if(!book) {
      throw new NotFoundException("Book is not found")
    }
    return book;
  }

  async create(book: CreateBookDTO): Promise<Book> {
    const newBook = await this.bookModel.create(book);
    return newBook;
  }

  async update(id: string, book: UpdateBookDTO): Promise<Book> {
    console.log(book);
    const updatedBook = await this.bookModel.findByIdAndUpdate(id, book, {
      new: true,
    });
    return updatedBook;
  }

  async delete(id: string): Promise<Book> {
    const book = await this.bookModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      {
        new: true,
      },
    );
    return book;
  }
}
