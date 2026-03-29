export type TMenuItem = {
  id: number;
  name: string;
  preview: string;
  price: number;
  weight: number;
  ingredients: string[];
};

export const menuList: TMenuItem[] = [
  {
    id: 1,
    name: 'Авокадо и огурец',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 100,
    weight: 200,
    ingredients: ['Авокадо', 'Огурец', 'Рис', 'Нори'],
  },
  {
    id: 2,
    name: 'Лосось и сливочный сыр',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 350,
    weight: 220,
    ingredients: ['Лосось', 'Сливочный сыр', 'Рис', 'Нори'],
  },
  {
    id: 3,
    name: 'Краб и авокадо',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 420,
    weight: 210,
    ingredients: ['Крабовое мясо', 'Авокадо', 'Рис', 'Нори'],
  },
  {
    id: 4,
    name: 'Тунец и огурец',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 300,
    weight: 200,
    ingredients: ['Тунец', 'Огурец', 'Рис', 'Нори'],
  },
  {
    id: 5,
    name: 'Угорь и сыр',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 450,
    weight: 230,
    ingredients: ['Угорь', 'Сливочный сыр', 'Рис', 'Нори', 'Соус унаги'],
  },
  {
    id: 6,
    name: 'Креветка темпура',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 380,
    weight: 240,
    ingredients: ['Креветка', 'Кляр темпура', 'Огурец', 'Рис', 'Нори'],
  },
  {
    id: 7,
    name: 'Овощной ролл',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 180,
    weight: 190,
    ingredients: ['Огурец', 'Авокадо', 'Морковь', 'Рис', 'Нори'],
  },
  {
    id: 8,
    name: 'Курица терияки',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 320,
    weight: 250,
    ingredients: ['Курица', 'Соус терияки', 'Огурец', 'Рис', 'Нори'],
  },
  {
    id: 9,
    name: 'Спайси тунец',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 340,
    weight: 210,
    ingredients: ['Тунец', 'Спайси соус', 'Рис', 'Нори'],
  },
  {
    id: 10,
    name: 'Филадельфия классик',
    preview: 'https://www.russianfood.com/dycontent/images_upl/559/big_558596.jpg',
    price: 500,
    weight: 260,
    ingredients: ['Лосось', 'Сливочный сыр', 'Авокадо', 'Огурец', 'Рис', 'Нори'],
  },
];
