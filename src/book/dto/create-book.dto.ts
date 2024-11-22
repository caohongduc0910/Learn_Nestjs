import { IsEnum, IsNumber, IsString } from "class-validator"
import { Category } from "../schemas/book.schema"

export class CreateBookDTO {
    @IsString()
    readonly title: string
    @IsString()
    readonly description: string
    @IsString()
    readonly author: string
    @IsNumber()
    readonly price: number 
    @IsEnum(Category)
    readonly category: Category
}