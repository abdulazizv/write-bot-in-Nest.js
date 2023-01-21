import { Context, Markup } from "telegraf";

export async function mainmenu(ctx:Context,lang:String) {
  if (lang == 'UZB') {
    await ctx.reply("Siz muvaffaqqiyatli ro'yxatdan o'tdingiz!<b>«Lady Taxi»</b> xizmatlaridan foydalanishingiz mumkin!", {
      parse_mode: 'HTML',
      ...Markup.keyboard([["🚖 Taksi chaqirish 🙋‍♀️", "🚚 Yetkazib berish 🙋‍♀️"], ["🙎🏼‍♀️ Profil", "🏠 Doimiy manzillar"]])
        .oneTime()
        .resize()
    })
  } else {
    await ctx.reply("Вы успешно зарегистрировались и можете пользоваться услугами <b>«Lady Taxi»</b>!", {
      parse_mode: 'HTML',
      ...Markup.keyboard([["🚖 Вызвать такси 🙋‍♀️", "🚚 Доставка 🙋‍♀️"], ["🙎🏼‍ профиль", "🏠 Постоянные адреса"]])
        .oneTime()
        .resize()
    })
  }
}