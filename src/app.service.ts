import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { MyBotName } from "./app.constants";
import { User } from "./models/user.model";

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectBot(MyBotName) private readonly bot: Telegraf<Context>
  ) {}
  async start(ctx: Context) {
    const user = await this.userRepository.findOne({
      where: { user_id: String(ctx.from.id) },
    });
    if (!user?.dataValues?.status) {
      if (!user) {
        await this.userRepository.create({
          user_id: String(ctx.from.id),
          first_name: ctx.from.first_name,
          last_name: ctx.from.last_name,
          username: ctx.from.username,
        });
      }
      await this.bot.telegram.sendChatAction(ctx.from.id, "typing");
      await ctx.reply(
        `Assalomu alaykum! | Здравствуйте!\nTilni tanlang | Выберите язык:`,
        {
          parse_mode: "HTML",
          ...Markup.keyboard([
            ["🇺🇿 O'zbek tili","🇷🇺 Русский язык"],
          ])
            .oneTime()
            .resize(),
        }
      );
    } else {
      await this.userRepository.update(
        { last_state: "lang" },
        { where: { user_id: String(ctx.from.id) } }
      );

      await this.bot.telegram.sendChatAction(ctx.from.id, "typing");
      await ctx.reply(`Botga hush kelibsiz 👇`, {
        parse_mode: "HTML",
      });
    }
  }

  async langUz(ctx:Context) {
    return this.saveLang(ctx,'UZB')
  }

  async langRu(ctx: Context) {
    return this.saveLang(ctx,'RUS')
  }
  async onContact(ctx: any) {
    const user = await this.userRepository.findOne({
      where: { user_id: String(ctx.from.id) },
    });
    if (!user) {
      await this.bot.telegram.sendChatAction(ctx.from.id, "typing");
      await ctx.reply(`Iltimos, <b>start</b> tugmasini bosing! 👇`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["/start"]])
          .oneTime()
          .resize(),
      });
    }
    if (ctx.message.contact.user_id !== ctx.from.id) {
      await this.bot.telegram.sendChatAction(ctx.from.id, "typing");
      await ctx.reply(
        `Iltimos o'zingizni raqamingizni yuboring, <b>"Telefon raqamni yuborish"</b> tugmasini bosing! `,
        {
          parse_mode: "HTML",
          ...Markup.keyboard([
            [Markup.button.contactRequest("📞 Telefon raqamni yuborish")],
          ])
            .oneTime()
            .resize(),
        }
      );
    }
    await this.userRepository.update(
      {
        phone_number: ctx.message.contact.phone_number,
        status: true,
        last_state: "main",
      },
      { where: { user_id: String(ctx.from.id) } }
    );
    await this.bot.telegram.sendChatAction(ctx.from.id, "typing");
    await ctx.reply(`Rahmat`, {
      parse_mode: "HTML",
    });
  }

  async registration(ctx:Context,lang:String){
  }
  async onStop(ctx: Context) {
    const user = await this.userRepository.findOne({
      where: { user_id: String(ctx.from.id) },
    });

    if (user?.dataValues.status) {
      await this.userRepository.update(
        { status: false, last_state: null },
        { where: { user_id: String(ctx.from.id) } }
      );

      await this.bot.telegram.sendChatAction(ctx.from.id, "typing");
      await ctx.reply(
        `Botdan chiqib ketdingiz, <b>start</b> tugmasini bosing! 👇`,
        {
          parse_mode: "HTML",
          ...Markup.keyboard([["/start"]])
            .oneTime()
            .resize(),
        }
      );
    } else {
      await ctx.reply(
        `Botdan mavjud emassiz, <b>start</b> tugmasini bosing! 👇`,
        {
          parse_mode: "HTML",
          ...Markup.keyboard([["/start"]])
            .oneTime()
            .resize(),
        }
      );
    }
  }

  async saveLang(ctx:Context, lang:String) {
    await User.update({
      user_lang: `${lang}`,
      last_state:'registration'
    },{
      where:{
        user_id: String(ctx.from.id)
      }
    })
    if(lang === 'UZB') {
      await ctx.reply(`Siz <b>«Lady Taxi»</b> botidan ilk marta foydalanayotganingiz uchun,
  bir martalik ro'yxatdan o'tishingiz lozim!`,{
        parse_mode:'HTML',
        ...Markup.keyboard(["✅ Ro'yxatdan o'tish"])
          .oneTime()
          .resize()
      })
    } else if(lang == 'RUS'){
        await ctx.reply(`Так как вы впервые пользуетесь ботом <b>«Lady Taxi»</b>, 
вам необходимо зарегистрироваться один раз!`,{
          parse_mode:'HTML',
          ...Markup.keyboard(["✅ Зарегистрироваться"])
            .oneTime()
            .resize()
        })
    }
  }
}
