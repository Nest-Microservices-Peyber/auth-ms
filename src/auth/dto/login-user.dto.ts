import { IsEmail, IsString, IsStrongPassword } from "class-validator"

export class LoginUserDto {

    @IsString()
    @IsEmail()
    emai: string

    @IsString()
    @IsStrongPassword()
    password: string
}