import { IsNotEmpty, IsString } from "class-validator"

export class SignInDTO {
    @IsNotEmpty()
    @IsString()
    readonly email: string
    @IsNotEmpty()
    @IsString()
    readonly password: string
}