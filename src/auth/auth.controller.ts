import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDTO } from './dto/signup.dto';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { SignInDTO } from './dto/signin.dto';
import { Public } from './decorators/public.decorator';
import { ChangePasswordDTO } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signup')
  async signup(@Body() signupDTO: SignUpDTO): Promise<ResponseData> {
    const newUser = await this.authService.signup(signupDTO);
    return new ResponseData(newUser, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Public()
  @Post('/signin')
  async signin(@Body() signinDTO: SignInDTO): Promise<ResponseData> {
    const token = await this.authService.signin(signinDTO);
    return new ResponseData(token, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Public()
  @Post('/verify')
  async verify(@Body() body: any): Promise<any> {
    const { codeId } = body;
    const response = await this.authService.verify(codeId);
    return new ResponseData(response, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Public()
  @Post('/re-verify')
  async reVerify(@Body() body: any): Promise<any> {
    const { email } = body;
    const response = await this.authService.reVerify(email);
    return new ResponseData(response, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Post('/change-password')
  async changePassword(
    @Body() changePasswordDTO: ChangePasswordDTO,
  ): Promise<any> {
    const response = await this.authService.changePassword(changePasswordDTO);
    return new ResponseData(response, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Public()
  @Post('/forget-password')
  async forgerPassword(@Body() body: any): Promise<any> {
    const { email } = body;
    const response = await this.authService.forgetPassword(email);
    return new ResponseData(response, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Public()
  @Post('/reset-password')
  async resetPassword(@Body() body: any): Promise<any> {
    const { otp, password, cfPassword } = body;
    const response = await this.authService.resetPassword(otp, password, cfPassword);
    return new ResponseData(response, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }
}
