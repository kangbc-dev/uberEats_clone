import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi'; // 이게 바로 typescript나 nestjs 언어로 이루어지지 않은 프레임웤/라이브러리 임포트 방법
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      //유효성 검사
      isGlobal: true, //어디서든 접근할 수 있는가? => 나중에 하위 모듈에서 providers에 명시 안해도 됨.
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test', // package.json 안에 start 명령어에 cross-env NODE_ENV=dev 일때 호출할 env파일 설정
      ignoreEnvFile: process.env.NODE_ENV === 'prod', // 위의 주석의 내용이 NODE_ENV=prod일 때 env참조 안함.
      validationSchema: Joi.object({
        //.env속 내용 유효성 체크
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true, //typeOrm이 db에 연결할 때 내 모듈의 현재 상태로 마이그레이션 한다는 의미(true일때)
      logging: process.env.NODE_ENV !== 'prod', //db조작시 콘솔에 표시해주는 기능
      entities: [User, Verification],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true, //기본적으로 작성,
      driver: ApolloDriver,
      context: ({ req }) => ({ user: req['user'] }),
    }),
    UsersModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  //클래스형 미들웨어는 app.module에서, 함수형은, main.ts에서 global설정이 가능.
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.POST,
    });
  }
}
