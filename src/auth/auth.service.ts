import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDTO } from './dto/signup.dto';
import { SignInDTO } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import mongoose from 'mongoose';
import { ChangePasswordDTO } from './dto/change-password.dto';
import generateOTP from 'src/helpers/otp.helper';
import { OTPService } from 'src/otp/otp.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<UserDocument>,
    private jwtService: JwtService,
    private mailService: MailService,
    private otpSerivce: OTPService,
    @InjectQueue('emailSending')
    private emailQueue: Queue,
  ) {}

  async signup(signupDTO: SignUpDTO): Promise<any> {
    const { email, password, cfPassword } = signupDTO;

    const existUser = await this.userModel.findOne({
      email: email,
    });

    if (existUser) {
      throw new ConflictException('User already exists');
    }

    if (password != cfPassword) {
      throw new ConflictException("Password doesn't match");
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    signupDTO.password = hashed;

    const codeID = uuidv4();
    signupDTO.codeId = codeID;

    const expirationTime = new Date();
    expirationTime.setSeconds(expirationTime.getSeconds() + 30);
    signupDTO.codeIdExpiresAt = expirationTime;

    const newUser = await this.userModel.create(signupDTO);

    const job = await this.emailQueue.add('register', {
      email: email,
      codeID: codeID
    });

    return newUser;
  }

  async signin(signinDTO: SignInDTO): Promise<any> {
    const { email, password } = signinDTO;

    const existUser = await this.userModel.findOne({
      email: email,
    });

    if (!existUser) {
      throw new NotFoundException("User doesn't exist");
    }

    const validPassword = await bcrypt.compare(password, existUser.password);
    if (!validPassword) {
      throw new NotFoundException('Wrong password');
    }

    if (existUser.isActive == false) {
      throw new NotFoundException('Account is deactivated');
    }

    const payload = { sub: existUser._id, username: existUser.email };
    const access_token = await this.jwtService.signAsync(payload);
    return access_token;
  }

  async verify(verifyCode: string): Promise<any> {
    const user = await this.userModel.findOne({
      codeId: verifyCode,
    });

    if (!user) {
      throw new NotFoundException('Code ID is invalid');
    } else if (user.isActive == true) {
      throw new BadRequestException('This account has already been activated.');
    } else if (new Date(user.codeIdExpiresAt) < new Date()) {
      throw new BadRequestException('This code is expired');
    }

    await this.userModel.updateOne(
      {
        _id: user._id,
      },
      {
        isActive: true,
      },
    );
    return 'Activated successfully';
  }

  async reVerify(email: string): Promise<any> {
    try {
      const codeID = uuidv4();

      const expirationTime = new Date();
      expirationTime.setSeconds(expirationTime.getSeconds() + 30);

      await this.userModel.updateOne(
        {
          email: email,
        },
        {
          codeId: codeID,
          codeIdExpiresAt: expirationTime,
        },
      );

      this.mailService.sendVerificationCode(email, codeID);

      return 'Resent verification code successfully! Check your email again';
    } catch (error) {
      console.log(error);
    }
  }

  async changePassword(changePasswordDTO: ChangePasswordDTO) {
    const { email, password, newPassword, cfPassword } = changePasswordDTO;

    const user = await this.userModel.findOne({
      email: email,
    });

    if (!user) {
      throw new NotFoundException('Wrong email!');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new NotFoundException('Wrong password');
    }

    if (newPassword != cfPassword) {
      throw new ConflictException("Password doesn't match");
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await this.userModel.updateOne(
      {
        email: email,
      },
      {
        password: hashed,
      },
    );

    return 'Changed password successfully!';
  }

  async forgetPassword(email: string) {
    const user = await this.userModel.findOne({
      email: email,
    });

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }
    const otp = generateOTP();

    const job = await this.emailQueue.add('passwordForget', {
      email: user.email,
      otp: otp
    });

    const expirationTime = new Date();
    expirationTime.setSeconds(expirationTime.getSeconds() + 30);
    this.otpSerivce.create(email, otp, expirationTime);

    return 'Successfully! Check your email to get OTP';
  }

  async resetPassword(otp: string, password: string, cfPassword: string) {
    const existOTP = await this.otpSerivce.findByOtp(otp);

    if (!existOTP) {
      throw new NotFoundException('OTP is expired');
    }

    if (password != cfPassword) {
      throw new ConflictException("Password doesn't match");
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    await this.userModel.updateOne(
      {
        email: existOTP.email,
      },
      {
        password: hashed,
      },
    );
    return 'Reset password successfully!';
  }
}
