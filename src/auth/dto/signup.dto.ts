import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class SignUpDTO {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string

    @IsNotEmpty()
    @IsString()
    password: string

    codeId: string
    codeIdExpiresAt: Date;
    
    @IsNotEmpty()
    @IsString()
    readonly cfPassword: string
}