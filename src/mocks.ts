export const ALL_CATEGORY = 'Все';

export const menuCategories = [
  'Фо и супы',
  'Бань ми',
  'Рис и лапша',
  'Горячие блюда',
  'Спринг-роллы',
  'Напитки',
  'Десерты',
] as const;

export type TMenuCategory = (typeof menuCategories)[number];
export type TMenuBadge = 'new' | 'hit' | 'spicy';

export type TMenuItem = {
  id: number;
  name: string;
  preview: string;
  price: number;
  weight: number;
  ingredients: string[];
  category: TMenuCategory;
  badges?: TMenuBadge[];
};

export const menuList: TMenuItem[] = [
  {
    id: 1,
    name: 'Фо бо классический',
    preview: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1200&q=80',
    price: 590,
    weight: 520,
    ingredients: ['Говяжий бульон', 'Рисовая лапша', 'Говядина', 'Кинза'],
    category: 'Фо и супы',
    badges: ['hit'],
  },
  {
    id: 2,
    name: 'Том ям с креветкой',
    preview: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    price: 640,
    weight: 430,
    ingredients: ['Креветка', 'Кокосовое молоко', 'Грибы', 'Лайм'],
    category: 'Фо и супы',
    badges: ['spicy'],
  },
  {
    id: 3,
    name: 'Бань ми с курицей',
    preview: 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&w=1200&q=80',
    price: 420,
    weight: 310,
    ingredients: ['Багет', 'Курица', 'Маринованные овощи', 'Кинза'],
    category: 'Бань ми',
  },
  {
    id: 4,
    name: 'Бань ми с говядиной',
    preview: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=1200&q=80',
    price: 470,
    weight: 330,
    ingredients: ['Багет', 'Говядина', 'Огурец', 'Соус хоисин'],
    category: 'Бань ми',
    badges: ['new'],
  },
  {
    id: 5,
    name: 'Пад тай с курицей',
    preview: 'https://images.unsplash.com/photo-1559314809-0f31657def5e?auto=format&fit=crop&w=1200&q=80',
    price: 560,
    weight: 360,
    ingredients: ['Рисовая лапша', 'Курица', 'Ростки сои', 'Арахис'],
    category: 'Рис и лапша',
    badges: ['hit'],
  },
  {
    id: 6,
    name: 'Жареный рис с морепродуктами',
    preview: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
    price: 620,
    weight: 390,
    ingredients: ['Рис жасмин', 'Креветка', 'Кальмар', 'Яйцо'],
    category: 'Рис и лапша',
  },
  {
    id: 7,
    name: 'Бо лук лак',
    preview: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    price: 780,
    weight: 340,
    ingredients: ['Говядина', 'Перец', 'Лук', 'Соус'],
    category: 'Горячие блюда',
    badges: ['hit'],
  },
  {
    id: 8,
    name: 'Карамельная свинина',
    preview: 'https://images.unsplash.com/photo-1604908176997-431949f44f35?auto=format&fit=crop&w=1200&q=80',
    price: 690,
    weight: 360,
    ingredients: ['Свинина', 'Карамельный соус', 'Чеснок', 'Рис'],
    category: 'Горячие блюда',
  },
  {
    id: 9,
    name: 'Нэм раны с курицей',
    preview: 'https://images.unsplash.com/photo-1633321702518-7feccafb94d5?auto=format&fit=crop&w=1200&q=80',
    price: 390,
    weight: 240,
    ingredients: ['Рисовая бумага', 'Курица', 'Овощи', 'Соус ныок мам'],
    category: 'Спринг-роллы',
  },
  {
    id: 10,
    name: 'Свежие спринг-роллы с креветкой',
    preview: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=1200&q=80',
    price: 450,
    weight: 250,
    ingredients: ['Креветка', 'Рисовая бумага', 'Манго', 'Мята'],
    category: 'Спринг-роллы',
    badges: ['new'],
  },
  {
    id: 11,
    name: 'Вьетнамский кофе со льдом',
    preview: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80',
    price: 260,
    weight: 300,
    ingredients: ['Кофе робуста', 'Сгущенное молоко', 'Лед'],
    category: 'Напитки',
  },
  {
    id: 12,
    name: 'Кокосовый пудинг',
    preview: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80',
    price: 320,
    weight: 170,
    ingredients: ['Кокосовое молоко', 'Сливки', 'Манго'],
    category: 'Десерты',
  },
];
