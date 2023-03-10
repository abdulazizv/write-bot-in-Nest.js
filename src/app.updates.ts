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
  @Command('driver')
  async driverMode(@Ctx() ctx:Context) {
    return this.appService.onDriver(ctx);
  }
  async
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

  @Hears('👩 Asosiy sahifa')
  async toMainPageUz(@Ctx() ctx:Context){
    return this.appService.toMainMenu(ctx,'UZB');
  }

  @Hears('👩‍🦱 Главная страница')
  async toMainPageRu(@Ctx() ctx:Context){
    return this.appService.toMainMenu(ctx,'RUS')
  }

  @Hears("👩🏼‍💻 Ro'yxatdan o'tish")
  async registrationDriver(@Ctx() ctx:Context) {
    return this.appService.registrationDriver(ctx,'UZB');
  }

  @Hears("👩🏼‍💻 Зарегистрироваться")
  async registrationDriverRu(@Ctx() ctx:Context) {
    return this.appService.registrationDriver(ctx,'RUS');
  }

  @Hears('🚕 Hozirdan ishlayman !')
  async workStatusTrue(@Ctx() ctx:Context) {
    return this.appService.workStatusTrue(ctx,'UZB');
  }
  @Hears('🛋 Hozircha dam olaman')
  async workStatusFalse(@Ctx() ctx:Context) {
    return this.appService.workStatusFalse(ctx,'UZB');
  }

  @Hears('🚕 Я сейчас работаю !')
  async workStatusTrueRU(@Ctx() ctx:Context) {
    return this.appService.workStatusTrue(ctx,'RUS');
  }

  @Hears('🛋 Я пока отдохну')
  async workStatusFalseRU(@Ctx() ctx:Context) {
    return this.appService.workStatusFalse(ctx,'RUS');
  }

  @Hears("⛔️ Ishni to'xtatish")
  async stopWorking(@Ctx() ctx:Context) {
    return this.appService.workStatusFalse(ctx,'UZB');
  }

  @Hears('⛔️ Остановить работу')
  async stopWorkingRU(@Ctx() ctx:Context) {
    return this.appService.workStatusFalse(ctx,'RUS');
  }
  @Action('defaultsave')
  async saveName(@Ctx() ctx:Context) {
    return this.appService.saveName(ctx);
  }

  @Action('savedefaultphone')
  async defaultSavePhone(@Ctx() ctx:Context) {
    return this.appService.defaultSavePhone(ctx);
  }
  @Action('changename')
  async changeName(@Ctx() ctx:Context) {
    return this.appService.changeName(ctx);
  }

  @Action('rulang')
  async changeRuLang(@Ctx() ctx:Context) {
    return this.appService.changeRuLang(ctx);
  }

  @Action(/^(verify=\d+)/)
  async verifyDriver(@Ctx() ctx:Context) {
    return this.appService.verifyDriver(ctx);
  }

  @Action(/^(otmen=\d+)/)
  async notAccessDriver(@Ctx() ctx:Context) {
    return this.appService.notAccesDriver(ctx);
  }
  @Action('ruleCallTaxy')
  async ruleTaxy(@Ctx() ctx:Context) {
    return this.appService.ruleCallTaxy(ctx)
  }
  @Action('uzblang')
  changeUzLang(@Ctx() ctx:Context) {
    return this.appService.changeUzLang(ctx)
  }
  @Action('changephoneNumber')
  async changePhoneNumber(@Ctx() ctx:Context) {
    return this.appService.phoneNumber(ctx);
  }

  @Action('changelanguage')
  async changeLanguage(@Ctx() ctx:Context) {
    return this.appService.changeLanguage(ctx)
  }
  @Action('cancelling')
  async cancellation(@Ctx() ctx:Context){
    return this.appService.cancel(ctx);
  }

  @Action('contract')
  async ruleContract(@Ctx() ctx:Context) {
    return this.appService.ruleContract(ctx);
  }

  @Action('connectWithStaff')
  async connectStaff(@Ctx() ctx:Context) {
    return this.appService.connectToStuff(ctx);
  }

  @Action('mainpage')
  async mainPage(@Ctx() ctx:Context) {
    return this.appService.mainPage(ctx);
  }

  @Action('checkDriverStatus')
  async checkDriverStatus(@Ctx() ctx: Context) {
    return this.appService.checkDriverStatus(ctx)
  }
  @On('message')
  async message(@Ctx() ctx:Context) {
    return this.appService.onMessage(ctx);
  }

}
