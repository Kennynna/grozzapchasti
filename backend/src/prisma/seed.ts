import { db } from './db';

async function main() {
  const runtime = await db.connect();

  // Сначала дети, потом родители: иначе мешают внешние ключи.
  // deleteAll() требует where(): без фильтра типы ставят this: never.
  await db.orm.public.SparePart.where((part) =>
    part.id.isNotNull(),
  ).deleteAll();
  await db.orm.public.Model.where((model) => model.id.isNotNull()).deleteAll();
  await db.orm.public.Mark.where((mark) => mark.id.isNotNull()).deleteAll();
  await db.orm.public.Category.where((category) =>
    category.id.isNotNull(),
  ).deleteAll();

  const categories = await db.orm.public.Category.createAll([
    { name: 'Двигатель', description: 'Мотор, ГРМ, охлаждение' },
    { name: 'Тормозная система', description: 'Колодки, диски, суппорты' },
    { name: 'Фильтры', description: 'Масляные, воздушные, салонные' },
    { name: 'Ходовая', description: 'Подвеска и рулевое' },
    { name: 'Электрика', description: 'Датчики, генератор, стартер' },
    { name: 'Аксессуары', description: 'Коврики, чехлы и прочее' },
  ]);

  const [engine, brakes, filters, , , accessories] = categories;

  const marks = await db.orm.public.Mark.createAll([
    {
      name: 'BMW',
      description: 'Немецкая марка премиум-класса',
      images: [],
    },
    {
      name: 'Mercedes-Benz',
      description: 'Немецкая марка премиум-класса',
      images: [],
    },
    {
      name: 'Toyota',
      description: 'Японская марка',
      images: [],
    },
  ]);

  const [bmw, mercedes, toyota] = marks;

  const models = await db.orm.public.Model.createAll([
    {
      name: 'X5',
      description: 'Кроссовер BMW',
      images: [],
      markId: bmw.id,
    },
    {
      name: 'C-Class',
      description: 'Седан Mercedes-Benz',
      images: [],
      markId: mercedes.id,
    },
    {
      name: 'Camry',
      description: 'Седан Toyota',
      images: [],
      markId: toyota.id,
    },
  ]);

  const [x5, cClass, camry] = models;

  const spareParts = await db.orm.public.SparePart.createAll([
    {
      name: 'Масляный фильтр',
      article: 'BMW-OIL-11427566327',
      description: 'Фильтр масла для BMW X5',
      images: [],
      price: 890,
      markId: bmw.id,
      modelId: x5.id,
      categoryId: filters.id,
    },
    {
      name: 'Тормозные колодки',
      article: 'MB-BRK-A0004200820',
      description: 'Передние колодки для Mercedes C-Class',
      images: [],
      price: 4500,
      markId: mercedes.id,
      modelId: cClass.id,
      categoryId: brakes.id,
    },
    {
      name: 'Воздушный фильтр',
      description: 'Фильтр воздуха для Toyota Camry',
      images: [],
      price: 1200,
      markId: toyota.id,
      modelId: camry.id,
      categoryId: filters.id,
    },
    {
      name: 'Ремень ГРМ',
      article: 'BMW-TBG-11317586925',
      description: 'Комплект ГРМ для BMW X5',
      images: [],
      price: 8900,
      markId: bmw.id,
      modelId: x5.id,
      categoryId: engine.id,
    },
    {
      name: 'Салонный фильтр BMW',
      article: 'BMW-CAB-ALL',
      description: 'Для всех моделей BMW',
      images: [],
      price: 1450,
      markId: bmw.id,
      modelId: null,
      categoryId: filters.id,
    },
    {
      name: 'Коврик универсальный',
      article: 'UNI-MAT-001',
      description: 'Подходит для всех автомобилей',
      images: [],
      price: 2500,
      markId: null,
      modelId: null,
      categoryId: accessories.id,
    },
  ]);

  console.log('Сиды готовы:', {
    categories: categories.map((category) => category.name),
    marks: marks.map((mark) => mark.name),
    models: models.map((model) => model.name),
    spareParts: spareParts.map((part) => part.name),
  });

  await runtime.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
