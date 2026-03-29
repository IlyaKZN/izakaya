export type TMenuItem = {
  id: number,
  name: string,
  preview: string,
  price: number,
  weight: number,
  ingredients: string[]
}

export const menuList: TMenuItem[] = [
  {
    id: 1,
    name: 'Авокадо и Огурец',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 100,
    weight: 200,
    ingredients: ['Авокадо', 'Огурец', 'Рис', 'Нори']
  },
  {
    id: 2,
    name: 'Лосось и Сливочный сыр',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 350,
    weight: 220,
    ingredients: ['Лосось', 'Сливочный сыр', 'Рис', 'Нори']
  },
  {
    id: 3,
    name: 'Краб и Авокадо',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 420,
    weight: 210,
    ingredients: ['Крабовое мясо', 'Авокадо', 'Рис', 'Нори']
  },
  {
    id: 4,
    name: 'Тунец и Огурец',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 300,
    weight: 200,
    ingredients: ['Тунец', 'Огурец', 'Рис', 'Нори']
  },
  {
    id: 5,
    name: 'Угорь и Сыр',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 450,
    weight: 230,
    ingredients: ['Угорь', 'Сливочный сыр', 'Рис', 'Нори', 'Соус Унаги']
  },
  {
    id: 6,
    name: 'Креветка Темпура',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 380,
    weight: 240,
    ingredients: ['Креветка', 'Кляр Темпура', 'Огурец', 'Рис', 'Нори']
  },
  {
    id: 7,
    name: 'Овощной ролл',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 180,
    weight: 190,
    ingredients: ['Огурец', 'Авокадо', 'Морковь', 'Рис', 'Нори']
  },
  {
    id: 8,
    name: 'Курица Терияки',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 320,
    weight: 250,
    ingredients: ['Курица', 'Соус Терияки', 'Огурец', 'Рис', 'Нори']
  },
  {
    id: 9,
    name: 'Спайси Тунец',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 340,
    weight: 210,
    ingredients: ['Тунец', 'Спайси соус', 'Рис', 'Нори']
  },
  {
    id: 10,
    name: 'Филадельфия Классик',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 500,
    weight: 260,
    ingredients: ['Лосось', 'Сливочный сыр', 'Авокадо', 'Огурец', 'Рис', 'Нори']
  }
]
