import { Context,Markup } from "telegraf";

export async function profilPart(ctx:Context,lang:String) {
  if(lang === 'UZB') {
    await ctx.reply("<b>Kerakli bo'limni tanlang: </b>", {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`👩 Ismni o'zgartirish`, 'changename')],
        [Markup.button.callback("📱 Telefon raqamni o'zgartirish", "changephoneNumber")],
        [Markup.button.callback("🏘 Doimiy manzillarini o'zgartirish", 'changeadress')],
        [Markup.button.callback("🌐 Tilni o'zgartirish", 'changelanguage')],
        [Markup.button.callback('👩‍🦰 Taksi chiqarish tartibi', 'ruleCallTaxy')],
        [Markup.button.callback('📄 Foydalanuvchi shartnomasi', 'contract')],
        [Markup.button.callback("☎️ Lady taxi xizmatiga bog'lanish", 'connectWithStaff')],
        [Markup.button.callback('🙎🏼‍♀️ Asosiy sahifa', 'mainpage')]
      ])
    })
  } else {
    await ctx.reply("<b>Выберите нужный раздел : </b>", {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        Markup.button.callback(`👩 Изменение имени`, 'changename'),
        Markup.button.callback("📱 Изменить номер телефона", "changephoneNumber"),
        Markup.button.callback("🏘 Смена постоянного адреса", 'changeadress'),
        Markup.button.callback("🌐 Изменить язык", 'changelanguage'),
        Markup.button.callback('👩‍🦰 Порядок выдачи такси', 'ruleCallTaxy'),
        Markup.button.callback('📄 Пользовательское Соглашение', 'contract'),
        Markup.button.callback("☎️ Связаться со службой Lady Taxy", 'connectWithStaff'),
        Markup.button.callback('🙎🏼‍♀️ Главная страница', 'mainpage')
      ])
    })
  }
}