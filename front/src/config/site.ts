// Статика витрины, не с бэка. Контакты, Telegram и копирайт править здесь. См. FRONT.md
export const site = {
  name: 'Groz Zapchasti',
  description:
    'Премиальные автозапчасти в Грозном. Оригинальные и проверенные компоненты, подбор по марке и модели.',
  heroEyebrow: 'Инженерия · Грозный',
  heroTitle: 'Премиальные автозапчасти',
  heroSubtitle: 'Оригинальные и проверенные компоненты для вашего автомобиля',
  heroHighlights: [
    { title: 'Оригинал', text: 'Проверенные узлы и расходники' },
    { title: 'Подбор', text: 'По марке и модели автомобиля' },
    { title: 'Гарантия', text: 'На каждую позицию в каталоге' },
  ],
  telegram: 'kennynna',
  orderMessageIntro: 'Здравствуйте! Хочу уточнить наличие и оформить заказ:',
  contacts: {
    phone: '+7 (900) 000-00-00',
    email: 'info@example.com',
    address: 'Грозный',
    hours: 'Пн–Сб, 9:00–19:00',
  },
  sections: {
    delivery: {
      id: 'delivery',
      title: 'Доставка',
      text: 'Доставим по Грозному и республике. Самовывоз — по адресу ниже, после подтверждения наличия в Telegram.',
    },
    warranty: {
      id: 'warranty',
      title: 'Гарантия',
      text: 'Оригинальные и проверенные компоненты. Гарантия на запчасть действует при сохранении товарного вида и документов.',
    },
    about: {
      id: 'about',
      title: 'О компании',
      text: 'Groz Zapchasti — витрина премиальных автозапчастей. Подбираем детали по марке и модели, без лишнего шума.',
    },
  },
  nav: [
    { to: '/', hash: 'catalog', label: 'Каталог' },
    { to: '/contacts', label: 'Контакты' },
  ],
  footerNav: [
    { to: '/contacts', hash: 'delivery', label: 'Доставка' },
    { to: '/contacts', hash: 'warranty', label: 'Гарантия' },
    { to: '/contacts', hash: 'about', label: 'О компании' },
  ],
} as const
