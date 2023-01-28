import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { MyBotName } from "./app.constants";
import { User } from "./models/user.model";
import { mainmenu } from "./helpers/main_menu";
import { profilPart } from "./helpers/profil_part";
import { Driver } from "./models/driver.model";
import axios from "axios";

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Driver) private driverRepository:typeof Driver,
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
        ...Markup.inlineKeyboard([Markup.button.callback(`Men ${ctx.from.first_name} ismini tanlayman`,'defaultsave')])
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
        ...Markup.inlineKeyboard([Markup.button.callback(`Я "${ctx.from.first_name}" выбираю имя`,'defaultsave')])
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
    const driver = await this.driverRepository.findOne({
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
      } else {
      if('text' in ctx.message) {
        await ctx.replyWithHTML(`ваш номер телефона изменился на ${ctx.message.text}`,{
          parse_mode:'HTML',
          ...Markup.keyboard([["🚖 Вызвать такси 🙋‍♀️", "🚚 Доставка 🙋‍♀️"],["🙎🏼‍ профиль", "🏠 Постоянные адреса"]])
            .oneTime()
            .resize()
        })
      }
    }
    } else if(user.last_state == 'car_number') {
      if('text' in ctx.message) {
        await this.driverRepository.update({
          car_number:`${ctx.message.text}`
        },{
          where: {
            user_id:`${ctx.from.id}`
          }
        })
        await this.userRepository.update({
          last_state:'tex-passport'
        },{
          where:{
            user_id:`${ctx.from.id}`
          }
        })
        if(user.user_lang == 'UZB') {
          await ctx.replyWithHTML("Mashinaning tex-passporti raqamini kiriting !")
        } else {
          await ctx.replyWithHTML("Введите номер технического паспорта автомобиля !")
        }
      } else {
        if(user.user_lang == "UZB"){
          return mainmenu(ctx,'UZB');
        } else {
          return mainmenu(ctx,'RUS')
        }
      }
    } else if(user.last_state == 'tex-passport') {
      let data;
      if ('text' in ctx.message) {
        try {
          data = await (await axios.get(
            `https://api-dtp.yhxbb.uz/api/egov/open_data/info_car?format=json&plate_number=${driver.car_number}&tech_pass=${ctx.message.text}`
          )).data;
        } catch (error) {
          if(user.user_lang == 'UZB') {
            await ctx.reply('Texnik ruxsatnomangiz yoki mashina raqamingiz xato')
          } else {
            await ctx.reply("Ваше техническое разрешение или номер транспортного средства неверны")
          }
        }
        if(data) {
          await this.driverRepository.update({
            last_state: 'non-active',
            car_model: `${data.pModel}`,
            car_color: `${data.pVehicleColor}`,
            car_year: `${data.pYear}`
          }, {
            where: {
              user_id: `${ctx.from.id}`
            }
          })
          await this.userRepository.update({
            last_state:'non-active'
          },{
            where:{
              user_id:`${ctx.from.id}`
            }
          })
        } else {
          console.log("error");
        }
      }
      const newDriver = await this.driverRepository.findOne({
        where:{
          user_id:`${ctx.from.id}`
        }
      })
      await ctx.telegram.sendMessage(`${process.env.ADMIN_ID}`,`${newDriver.first_name}\n ${newDriver.last_name}\n ${newDriver.car_model}\n ${newDriver.car_number}\n ${newDriver.car_year}\n ${newDriver.user_id}`,{
        parse_mode:'HTML',
        ...Markup.inlineKeyboard([Markup.button.callback("✅ Tasdiqlayman",`verify=${ctx.from.id}`),Markup.button.callback("❌ Rad qilinsin",`otmen=${ctx.from.id}`)])
      });
      await ctx.replyWithHTML("Ma'lumotlaringiz <b>admin</b> ga yetkazildi. Admin ruxsat berishi bilan sizga activelik taqdim qilinadi")
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

  async connectToStuff(ctx:Context) {
    const user = await this.userRepository.findOne({
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    if(user.user_lang == 'UZB') {
      await ctx.reply('<b>Murojaat uchun </b>@abdulazizvr',{
        parse_mode:'HTML',
        ...Markup.keyboard(["👩 Asosiy sahifa"])
          .oneTime()
          .resize()
      })
    } else {
      await ctx.reply('<b>для связи </b> @abdulazizvr',{
        parse_mode:'HTML',
        ...Markup.keyboard(["👩‍🦱 Главная страница"])
          .oneTime()
          .resize()
      })
    }
  }

  async mainPage(ctx:Context) {
    const user = await this.userRepository.findOne({
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    if(user.user_lang == 'UZB') {
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

  async onDriver(ctx:Context) {
    const user = await this.userRepository.findOne({
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    if(!user) {
      await ctx.replyWithHTML("<b>Lady Taxi xizmatining haydovchi rejimiga xush kelibsiz</b>")
      await ctx.replyWithHTML("Haydovchi rejimiga o'tish uchun avval Mijoz rejimiga o'tib profilning Ism va Telefon ma'lumotlarini to'liq kiriting.")
    } else {
      await this.driverRepository.create({
        user_id:`${user.user_id}`,
        first_name:`${user.first_name}`,
        last_name:`${user.last_name}`,
        username: `${user.username}`,
        user_lang:`${user.user_lang}`,
        phone_number:`${user.phone_number}`
      })
      if(user.user_lang == 'UZB'){
      await ctx.reply("Lady Taxi xizmatining haydovchi rejimiga xush kelibsiz !")
      await ctx.reply("Lady Taxi xizmatida haydovchi sifatida ro'yxatdan o'tish uchun «Ro'yxatdan o'tish» tugmasini bosing.",{
        parse_mode:'HTML',
        ...Markup.keyboard(["👩🏼‍💻 Ro'yxatdan o'tish"])
          .oneTime()
          .resize()
      })
      } else {
        await ctx.reply('Добро пожаловать в режим Таксист!')
        await ctx.reply("Чтобы зарегистрироваться в качестве водителя в сервисе Lady Taxi, нажмите кнопку «Зарегистрироваться».",{
          parse_mode:'HTML',
          ...Markup.keyboard(["👩🏼‍💻 Зарегистрироваться"])
            .oneTime()
            .resize()
        })
      }
    }
  }

  async registrationDriver(ctx:Context,lang:String) {
    await this.userRepository.update({
      last_state:'car_number'
    },{
      where:{
        user_id:`${ctx.from.id}`
      }
    })
    if(lang == 'UZB') {
      await ctx.reply('Avtomobil raqamini kiriting',{
        parse_mode:'HTML'
      })
    } else {
      await ctx.reply('Введите номер автомобиля',{
        parse_mode:'HTML'
      })
    }
  }

  async verifyDriver(ctx:Context) {
    let index;
    if('match' in ctx) {
      const message = ctx.match[0]
      index = message.split('=')[1]
    }
    const idUser = await this.driverRepository.findOne({
      where: {
        user_id:`${index}`
      }
    })
    console.log(typeof index);
    if(idUser.user_lang == 'UZB') {
      await ctx.telegram.sendMessage(`${index}`, "Admin sizga ruxsat berdi. Statusingizni tekshirib oling !", {
        parse_mode:'HTML',
        ...Markup.inlineKeyboard([Markup.button.callback("☑️ Statusni tekshirish","checkDriverStatus")])
      })
    } else {
      await ctx.telegram.sendMessage(`${index}`, "Админ дал вам разрешение. Проверьте свой статус !", {
        parse_mode:'HTML',
        ...Markup.inlineKeyboard([Markup.button.callback("☑️ Проверь состояние","checkDriverStatus")])
      })
    }
  }
}
