import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { MyBotName } from "./app.constants";
import { User } from "./models/user.model";
import { mainmenu } from "./helpers/main_menu";
import { profilPart } from "./helpers/profil_part";

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
      if(user.last_state != 'finish') {
        await this.userRepository.update(
          { last_state: "lang" },
          { where: { user_id: String(ctx.from.id) } }
        );
      }

      await this.bot.telegram.sendChatAction(ctx.from.id, "typing");
      if(user.user_lang == 'UZB') {
        return mainmenu(ctx,'UZB')
      } else {
        return mainmenu(ctx,'RUS')
      }
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
    if(user.user_lang == 'UZB') {
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
          last_state: "real_name",
        },
        { where: { user_id: String(ctx.from.id) } }
      );
      await this.bot.telegram.sendChatAction(ctx.from.id, "typing");
      await ctx.reply(`<b>Sizga murojaat qilish uchun quyidagi ismingizni tanlang:</b>`, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([Markup.button.callback(`Men ${ctx.from.username} ismini tanlayman`,'defaultsave')])
      });
      await ctx.replyWithHTML('Yoki haqiqiy ismingizni kiriting:')
    } else {
      if (ctx.message.contact.user_id !== ctx.from.id) {
        await this.bot.telegram.sendChatAction(ctx.from.id, "typing");
        await ctx.reply(
          `Пожалуйста, пришлите свой номер, <b>"Отправить номер телефона"</b> нажать на кнопку! `,
          {
            parse_mode: "HTML",
            ...Markup.keyboard([
              [Markup.button.contactRequest("📞 Отправить номер телефона")],
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
          last_state: "real_name",
        },
        { where: { user_id: String(ctx.from.id) } }
      );
      await this.bot.telegram.sendChatAction(ctx.from.id, "typing");
      await ctx.reply(`<b>Пожалуйста, выберите свое имя ниже, чтобы связаться с вами:</b>`, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([Markup.button.callback(`Я "${ctx.from.username}" выбираю имя`,'defaultsave')])
      });
      await ctx.replyWithHTML('Или введите свое настоящее имя:')
    }
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
  async registration(ctx:Context,lang:String) {
    if (lang == 'UZB') {
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
    else {
      await ctx.reply(
        ` Пожалуйста, пришлите свой номер, нажмите <b>"Отправить номер телефона"</b>! `,
        {
          parse_mode: "HTML",
          ...Markup.keyboard([
            [Markup.button.contactRequest("📞 Отправить номер телефона")],
          ])
            .oneTime()
            .resize(),
        }
      );
    }
  }

  async saveName(ctx:Context) {
    const user = await this.userRepository.findOne({
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    await this.userRepository.update({
      real_name:`${user.username}`,
      last_state:'ads_phone_number'
    },{
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    if(user.user_lang == 'UZB') {
      await ctx.reply(`<b>Siz bilan bog'lanish uchun quyidagi telefon raqamingizni tanlang:</b>`, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([Markup.button.callback(`Men ${user.phone_number} raqamini tanlayman`, 'savedefaultphone')])
      })
      await ctx.replyWithHTML('Yoki boshqa ishlab turgan telefon raqam kiriting (namuna: 931234567):')
    } else {
      await ctx.reply(`<b>Выберите свой номер телефона ниже, чтобы связаться с вами:</b>`, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([Markup.button.callback(`я выбираю ${user.phone_number} номер`, 'savedefaultphone')])
      })
      await ctx.replyWithHTML('Или введите другой рабочий номер телефона (пример: 931234567):')
    }
  }

  async onMessage(ctx:Context) {
    const user = await this.userRepository.findOne({
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    if(user.last_state === "real_name") {
      if('text' in ctx.message) {
        await this.userRepository.update({
          real_name: `${ctx.message.text}`,
          last_state: 'ads_phone_number'
        }, {
          where: {
            user_id: `${ctx.from.id}`
          }
        })
      }
      if(user.user_lang == 'UZB') {
        await ctx.reply(`<b>Siz bilan bog'lanish uchun quyidagi telefon raqamingizni tanlang:</b>`, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([Markup.button.callback(`Men ${user.phone_number} raqamini tanlayman`, 'savedefaultphone')])
        })
        await ctx.reply('Yoki boshqa ishlab turgan telefon raqam kiriting (namuna: 931234567):')
      } else {
        await ctx.reply(`<b>Выберите свой номер телефона ниже, чтобы связаться с вами:</b>`, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([Markup.button.callback(`я выбираю ${user.phone_number} номер`, 'savedefaultphone')])
        })
        await ctx.reply('Или введите другой рабочий номер телефона (пример: 931234567):')
      }
    } else if(user.last_state === 'ads_phone_number'){
        if('text' in ctx.message) {
          await this.userRepository.update({
            ads_phone_number: `${ctx.message.text}`,
            last_state: 'finish'
          }, {
            where: {
              user_id: `${ctx.from.id}`
            }
          })
        }
      if(user.user_lang == 'UZB') {
        return mainmenu(ctx,'UZB')
      } else {
        return mainmenu(ctx,'RUS')
      }
    } else if(user.last_state == 'changeName') {
      const user = await this.userRepository.findOne({
        where:{
          user_id:`${ctx.from.id}`
        }
      })
      if('text' in ctx.message) {
        await this.userRepository.update({
          real_name:`${ctx.message.text}`,
          last_state:'finish'
        },{
          where:{
            user_id:`${ctx.from.id}`
          }
        })
      }
      if(user.user_lang == 'UZB') {
        if ('text' in ctx.message) {
          await ctx.replyWithHTML(`Ismingiz ${ctx.message.text} ga o'zgartirildi`,{
            parse_mode:'HTML',
            ...Markup.keyboard([["🚖 Taksi chaqirish 🙋‍♀️", "🚚 Yetkazib berish 🙋‍♀️"], ["🙎🏼‍♀️ Profil", "🏠 Doimiy manzillar"]])
              .oneTime()
              .resize()
          })
        }
      } else {
        if('text' in ctx.message) {
          await ctx.replyWithHTML(`Ваше имя изменено на ${ctx.message.text}`,{
            parse_mode:'HTML',
            ...Markup.keyboard([["🚖 Вызвать такси 🙋‍♀️", "🚚 Доставка 🙋‍♀️"],["🙎🏼‍ профиль", "🏠 Постоянные адреса"]])
              .oneTime()
              .resize()
          })
        }
      }
    } else if(user.last_state === 'changePhoneNumber'){
        const user = await this.userRepository.findOne({
          where:{
          user_id:`${ctx.from.id}`
            }
        })
      if('text' in ctx.message) {
        await this.userRepository.update({
          ads_phone_number:`${ctx.message.text}`,
          last_state:'finish'
        },{
          where:{
            user_id:`${ctx.from.id}`
          }
        })
      }
      if(user.user_lang == 'UZB') {
        if ('text' in ctx.message) {
          await ctx.replyWithHTML(`Telefon raqamingiz ${ctx.message.text} ga o'zgartirildi`,{
            parse_mode:'HTML',
            ...Markup.keyboard([["🚖 Taksi chaqirish 🙋‍♀️", "🚚 Yetkazib berish 🙋‍♀️"], ["🙎🏼‍♀️ Profil", "🏠 Doimiy manzillar"]])
              .oneTime()
              .resize()
          })
        }
      }  else {
      if('text' in ctx.message) {
        await ctx.replyWithHTML(`ваш номер телефона изменился на ${ctx.message.text}`,{
          parse_mode:'HTML',
          ...Markup.keyboard([["🚖 Вызвать такси 🙋‍♀️", "🚚 Доставка 🙋‍♀️"],["🙎🏼‍ профиль", "🏠 Постоянные адреса"]])
            .oneTime()
            .resize()
        })
      }
    }
    }
  }
  async defaultSavePhone(ctx:Context){
    const user = await this.userRepository.findOne({
      where:{
        user_id: `${ctx.from.id}`
      }
    })
    await this.userRepository.update({
      last_state:"finish"
    },{
      where: {
        user_id: `${ctx.from.id}`
      }
    })
    if(user.user_lang === 'UZB'){
      return mainmenu(ctx,'UZB')
    } else {
      return mainmenu(ctx,'RUS')
    }
  }

  async hearsProfil(ctx:Context,lang:String) {
    if(lang == 'UZB'){
      return profilPart(ctx,'UZB')
    } else {
      return profilPart(ctx,'RUS')
    }
  }

  async changeName(ctx:Context) {
    const user = await this.userRepository.findOne({
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    await this.userRepository.update({
      last_state: 'changeName'
    },{
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    if(user.user_lang == 'UZB'){
      await ctx.reply('Ismingizni kiriting',{
        parse_mode:'HTML',
        ...Markup.inlineKeyboard([Markup.button.callback('🙅‍♀️ Bekor qilish','cancelling')])
      })
    } else if(user.user_lang == 'RUS') {
      await ctx.reply('Введите ваше имя',{
        parse_mode:'HTML',
        ...Markup.inlineKeyboard([Markup.button.callback('🙅‍♀️ Отмена','cancelling')])
      })
    }
  }

  async phoneNumber(ctx:Context) {
    const user = await this.userRepository.findOne({
      where:{
        user_id: `${ctx.from.id}`
      }
    })
    await this.userRepository.update({
      last_state:'changePhoneNumber'
    },{
      where:{
        user_id: `${ctx.from.id}`
      }
    })
    if(user.user_lang == 'UZB') {
      await ctx.reply(`Yangi telefon raqam kiriting`,{
        parse_mode:'HTML',
        ...Markup.inlineKeyboard([Markup.button.callback('🙅‍♀️ Bekor qilish','cancelling')])
      })
    } else {
      await ctx.reply('Введите новый номер телефона',{
        parse_mode:'HTML',
        ...Markup.inlineKeyboard([Markup.button.callback('🙅‍♀️ Отмена','cancelling')])
      })
    }
  }
  async cancel(ctx:Context) {
    await this.userRepository.update({
      last_state:'finish'
    },{
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    const user = await this.userRepository.findOne({
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    if(user.user_lang === 'UZB') {
        await ctx.replyWithHTML(`<b>Lady Taxy</b> bilan hammasi yanada oson ! `, {
          parse_mode: 'HTML',
          ...Markup.keyboard([["🚖 Taksi chaqirish 🙋‍♀️", "🚚 Yetkazib berish 🙋‍♀️"], ["🙎🏼‍♀️ Profil", "🏠 Doimiy manzillar"]])
            .oneTime()
            .resize()
        })
    }else {
        await ctx.replyWithHTML(`С <b>Lady Taxy</b> все проще! `,{
          parse_mode:'HTML',
          ...Markup.keyboard([["🚖 Вызвать такси 🙋‍♀️", "🚚 Доставка 🙋‍♀️"],["🙎🏼‍ профиль", "🏠 Постоянные адреса"]])
            .oneTime()
            .resize()
        })
    }
  }

  async changeLanguage(ctx:Context) {
    const user = await this.userRepository.findOne({
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    await ctx.reply('<b>Tilni tanlang/Выберите язык</b>',{
      parse_mode:'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`🇺🇿 O'zbek tili`,`uzblang`)],
        [Markup.button.callback(`🇷🇺 Русский язык`,`rulang`)],
        [Markup.button.callback(`🙅‍♀️ Bekor qilish/Отмена`,`cancelling`)]
      ])
    })
  }

  async changeRuLang(ctx: Context) {
    await this.userRepository.update({
      user_lang:'RUS'
    },{
      where:{
        user_id:`${ctx.from.id}`
      }
    });
    await ctx.reply("<b>Язык изменен!</b>",{
      parse_mode:'HTML',
      ...Markup.keyboard(["👩‍🦱 Главная страница"])
        .oneTime()
        .resize()
    })

  }
  async changeUzLang(ctx:Context) {
    await this.userRepository.update({
      user_lang:'UZB'
    },{
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    await ctx.reply("<b>Til o'zgartirildi</b>",{
      parse_mode:'HTML',
      ...Markup.keyboard(["👩 Asosiy sahifa"])
        .oneTime()
        .resize()
    })
  }

  async toMainMenu(ctx:Context, lang:String) {
    if(lang === 'UZB'){
      await ctx.reply(`<b>🌹 Lady Taxy</b> to'gri tanlov`,{
        parse_mode:'HTML',
        ...Markup.keyboard([["🚖 Taksi chaqirish 🙋‍♀️", "🚚 Yetkazib berish 🙋‍♀️"], ["🙎🏼‍♀️ Profil", "🏠 Doimiy manzillar"]])
          .oneTime()
          .resize()
      })
    } else {
      await ctx.reply(`<b>🌹 Lady Taxy </b> правильный выбор`,{
        parse_mode:'HTML',
        ...Markup.keyboard([["🚖 Вызвать такси 🙋‍♀️", "🚚 Доставка 🙋‍♀️"],["🙎🏼‍ профиль", "🏠 Постоянные адреса"]])
          .oneTime()
          .resize()
      })
    }
  }

  async ruleCallTaxy(ctx:Context) {
    const user = await this.userRepository.findOne({
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    if(user.user_lang == 'UZB') {
      await ctx.reply('<b>Bu yerda «Taksi chaqirish tartibi» yoziladi</b>',{
        parse_mode:'HTML',
        ...Markup.keyboard(["👩 Asosiy sahifa"])
          .oneTime()
          .resize()
      })
    } else {
      await ctx.reply(`<b>"Процедура вызова такси" написана здесь</b>`,{
        parse_mode:'HTML',
        ...Markup.keyboard(["👩‍🦱 Главная страница"])
          .oneTime()
          .resize()
      })
    }
  }

  async ruleContract(ctx:Context) {
    const user = await this.userRepository.findOne({
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    if(user.user_lang == 'UZB') {
      await ctx.reply('<b>Bu yerda «Foydalanuvchi shartnomasi» yoziladi</b>',{
        parse_mode:'HTML',
        ...Markup.keyboard(["👩 Asosiy sahifa"])
          .oneTime()
          .resize()
      })
    } else {
      await ctx.reply(`<b>"Пользовательское Соглашение" написана здесь</b>`,{
        parse_mode:'HTML',
        ...Markup.keyboard(["👩‍🦱 Главная страница"])
          .oneTime()
          .resize()
      })
    }
  }
}
