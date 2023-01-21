import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { TelegrafModule } from 'nestjs-telegraf';
import { MyBotName } from './app.constants';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppUpdate } from './app.updates';
import { User } from './models/user.model';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      botName: MyBotName,
      useFactory: () => ({
        token: process.env.BOT_TOKEN,
        middlewares: [],
        include: [],
      }),
    }),
    ConfigModule.forRoot({
      envFilePath: `.env`,
    }),
    SequelizeModule.forFeature([User,]),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [ User],
      autoLoadModels: true,
      logging: false,
    }),
  ],

  controllers: [AppController],
  providers: [AppService, AppUpdate],
})
export class AppModule {}