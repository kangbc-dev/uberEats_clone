import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {
    // console.log('haha' + this.config.get('PRIVATE_KEY'));
  }
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        return {
          ok: false,
          error:
            '이미 해당 이메일을 사용중인 계정이 있습니다. 회원가입에 실패하였습니다.',
        };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      // 이메일 인증 로직
      const verificiation = await this.verification.save(
        this.verification.create({
          user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verificiation.code);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: '에러가 존재합니다.' };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
      });
      if (!user) {
        return {
          ok: false,
          error: '해당 email주소를 가진 유저 정보가 없습니다.',
        };
      }
      //password check
      const passwordCorrect = await user.checkPassword(password); //user entity에 있는 method
      if (!passwordCorrect)
        return { ok: false, error: '비밀번호가 일치하지 않습니다.' };
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error,
      };
    }
  }
  async findById(id: number): Promise<UserProfileOutput> {
    try {
      // const user = await this.users.findOne({ where: { id }, select: ['id'] });
      const user = await this.users
        .createQueryBuilder('user')
        .where('user.id = :id', { id })
        .addSelect('user.password')
        .getOne();
      if (user) {
        return {
          ok: true,
          user: user,
        };
      }
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({ where: { id: userId } });
      if (email) {
        if (user.email === email)
          return {
            ok: false,
            error: '이전에 사용하신 이메일은 사용하실 수 없습니다.',
          };
        user.email = email;
        user.verified = false;
        await this.verification.save(this.verification.create({ user })); // 이부분 때문에, oneToOne 관계에 의해, 이미 verification이 존재할 경우, 새로운 verification이 생성될 수 없어 인증되지 않은 상태에서의 editProfile이 동작하지 않는다. 버그일까?
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: '프로필 수정에 실패하였습니다.' };
    }
  }
  async verifyEmail({ code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      const target = await this.verification.findOne({
        where: { code },
        relations: ['user'],
      });
      if (!target) throw new Error();
      console.log(target, target.user);
      const user = await this.users.findOne({ where: { id: target.user.id } });
      user.verified = true;
      await this.users.save(user);
      await this.verification.remove(target);
      return {
        ok: true,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: '인증에 실패하였습니다.',
      };
    }
  }
}
