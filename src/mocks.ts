export const ALL_CATEGORY = 'Все'

export const menuCategories = [
  'Фо и супы',
  'Бань ми',
  'Рис и лапша',
  'Горячие блюда',
  'Спринг-роллы',
  'Напитки',
  'Десерты',
] as const

export type TMenuCategory = (typeof menuCategories)[number]
export type TMenuBadge = 'new' | 'hit' | 'spicy'

export type TMenuItem = {
  id: number
  name: string
  preview: string
  price: number
  weight: number
  ingredients: string[]
  category: TMenuCategory
  badges?: TMenuBadge[]
}

export const menuList: TMenuItem[] = [
  {
    id: 1,
    name: 'Фо бо классический',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 590,
    weight: 520,
    ingredients: ['Говяжий бульон', 'Рисовая лапша', 'Говядина', 'Кинза'],
    category: 'Фо и супы',
    badges: ['hit'],
  },
  {
    id: 2,
    name: 'Том ям с креветкой',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 640,
    weight: 430,
    ingredients: ['Креветка', 'Кокосовое молоко', 'Грибы', 'Лайм'],
    category: 'Фо и супы',
    badges: ['spicy'],
  },
  {
    id: 3,
    name: 'Бань ми с курицей',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 420,
    weight: 310,
    ingredients: ['Багет', 'Курица', 'Маринованные овощи', 'Кинза'],
    category: 'Бань ми',
  },
  {
    id: 4,
    name: 'Бань ми с говядиной',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 470,
    weight: 330,
    ingredients: ['Багет', 'Говядина', 'Огурец', 'Соус хоисин'],
    category: 'Бань ми',
    badges: ['new'],
  },
  {
    id: 5,
    name: 'Пад тай с курицей',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 560,
    weight: 360,
    ingredients: ['Рисовая лапша', 'Курица', 'Ростки сои', 'Арахис'],
    category: 'Рис и лапша',
    badges: ['hit'],
  },
  {
    id: 6,
    name: 'Жареный рис с морепродуктами',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 620,
    weight: 390,
    ingredients: ['Рис жасмин', 'Креветка', 'Кальмар', 'Яйцо'],
    category: 'Рис и лапша',
  },
  {
    id: 7,
    name: 'Бо лук лак',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 780,
    weight: 340,
    ingredients: ['Говядина', 'Перец', 'Лук', 'Соус'],
    category: 'Горячие блюда',
    badges: ['hit'],
  },
  {
    id: 8,
    name: 'Карамельная свинина',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 690,
    weight: 360,
    ingredients: ['Свинина', 'Карамельный соус', 'Чеснок', 'Рис'],
    category: 'Горячие блюда',
  },
  {
    id: 9,
    name: 'Нэм раны с курицей',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 390,
    weight: 240,
    ingredients: ['Рисовая бумага', 'Курица', 'Овощи', 'Соус ныок мам'],
    category: 'Спринг-роллы',
  },
  {
    id: 10,
    name: 'Свежие спринг-роллы с креветкой',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 450,
    weight: 250,
    ingredients: ['Креветка', 'Рисовая бумага', 'Манго', 'Мята'],
    category: 'Спринг-роллы',
    badges: ['new'],
  },
  {
    id: 11,
    name: 'Вьетнамский кофе со льдом',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 260,
    weight: 300,
    ingredients: ['Кофе робуста', 'Сгущенное молоко', 'Лед'],
    category: 'Напитки',
  },
  {
    id: 12,
    name: 'Кокосовый пудинг',
    preview: 'https://www.gastronom.ru/recipe/26529/fo-bo-govjazhij-sup-s-lapshoj',
    price: 320,
    weight: 170,
    ingredients: ['Кокосовое молоко', 'Сливки', 'Манго'],
    category: 'Десерты',
  },
]
