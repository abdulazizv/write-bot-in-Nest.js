import { Action, Command, Ctx, On, Start, Update,Hears } from 'nestjs-telegraf';
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
  @Command('stop')
  async onStop(@Ctx() ctx: Context) {
    return this.appService.onStop(ctx);
  }

  @Hears("🇺🇿 O'zbek tili")
  async uzLang(@Ctx() ctx: Context) {
    return this.appService.langUz(ctx)
  }

  @Hears('🇷🇺 Русский язык')
  async ruLang(ctx: Context) {
    return this.appService.langRu(ctx)
  }

  @Hears("✅ Ro'yxatdan o'tish")
  async registration(@Ctx() ctx:Context) {
    return this.appService.registration(ctx,'UZB')
  }
  @Hears('✅ Зарегистрироваться')
  async register(@Ctx() ctx:Context) {
    return this.appService.registration(ctx,'RUS')
  }

  @Hears('🙎🏼‍♀️ Profil')
  async toProfilUz(@Ctx() ctx:Context) {
    return this.appService.hearsProfil(ctx,'UZB')
  }

  @Hears('🙎🏼‍ профиль')
  async toProfilRu(@Ctx() ctx:Context) {
    return this.appService.hearsProfil(ctx,'RUS')
  }
  @Action('defaultsave')
  async saveName(@Ctx() ctx:Context) {
    return this.appService.saveName(ctx);
  }

  @Action('savedefaultphone')
  async defaultSavePhone(@Ctx() ctx:Context) {
    return this.appService.defaultSavePhone(ctx)
  }
  @Action('changename')
  async changeName(@Ctx() ctx:Context) {
    return this.appService.changeName(ctx)
  }

  @Action('changephoneNumber')
  async changePhoneNumber(@Ctx() ctx:Context) {
    return this.appService.phoneNumber(ctx);
  }

  @Action('cancelling')
  async cancellation(@Ctx() ctx:Context){
    return this.appService.cancel(ctx);
  }

  @On('message')
  async message(@Ctx() ctx:Context) {
    return this.appService.onMessage(ctx);
  }

}
