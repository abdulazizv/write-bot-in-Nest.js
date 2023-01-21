import { Action, Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { AppService } from './app.service';

@Update()
export class AppUpdate {
  constructor(private readonly appService: AppService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    return this.appService.start(ctx);
  }
  @On('contact')
  async onContact(@Ctx() ctx: Context) {
    return this.appService.onContact(ctx);
  }
  @On('message')
  async message(@Ctx() ctx:Context) {
    return this.appService
  }
  @Command('stop')
  async onStop(@Ctx() ctx: Context) {
    return this.appService.onStop(ctx);
  }
}
