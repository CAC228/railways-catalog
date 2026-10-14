/** Мобильный отдела продаж, на нём же WhatsApp и Telegram. */
export const PHONE_MOBILE = '+7 (965) 615-50-59'

/**
 * Городской номер. Пока пустой: на сайте под него оставлено место того же размера
 * (шапка, меню, подвал, главная, «Контакты»), номер появится везде, как только его впишут сюда.
 */
export const PHONE_CITY = ''

/** Куда звонят значки трубки без номера рядом: городской, а пока его нет — мобильный. */
export const PHONE_CALL = PHONE_CITY || PHONE_MOBILE

export const tel = (phone: string) => `tel:+${phone.replace(/\D/g, '')}`
