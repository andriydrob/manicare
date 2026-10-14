export type ServiceId = 'manicure' | 'pedicure' | 'nail-extensions' | 'lash-extensions' | 'brows';

export interface Service {
  id: ServiceId; title: string; group: 'nails' | 'gaze'; price: string; duration: string;
  description: string; includes: string[];
}
export const filters = [
  { key: 'all', label: 'Усі послуги' },
  { key: 'nails', label: 'Нігті' },
  { key: 'gaze', label: 'Погляд' },
] as const;

export const services: Service[] = [
  { id: 'manicure', title: 'Манікюр', group: 'nails', price: 'від 900 ₴', duration: '1 год 30 хв',
    description: 'Охайна форма, бездоганна кутикула та стійке покриття гель-лаком у вашому відтінку.',
    includes: ['Комбінований або апаратний манікюр', 'Корекція форми', 'Покриття та дизайн'] },
  { id: 'pedicure', title: 'Педикюр', group: 'nails', price: 'від 1 200 ₴', duration: '2 год',
    description: 'Догляд за стопами з делікатним приладним очищенням, зволоженням і довговічним покриттям.',
    includes: ['Обробка стопи та нігтів', 'Масаж зі зволожувальним кремом', 'Покриття гель-лаком'] },
  { id: 'nail-extensions', title: 'Нарощування нігтів', group: 'nails', price: 'від 1 800 ₴', duration: '3 год',
    description: 'Моделювання довжини й архітектури нігтя гелем або акрилом. Легко, природно, міцно.',
    includes: ['Консультація щодо форми', 'Моделювання на формах або типсах', 'Покриття та декор'] },
  { id: 'lash-extensions', title: 'Нарощування вій', group: 'gaze', price: 'від 1 500 ₴', duration: '2 год 30 хв',
    description: 'Ефект від природного до виразного: підбір вигину та довжини під форму ваших очей.',
    includes: ['Класика, 2D, 3D або об’єм', 'Підбір вигину й довжини', 'Рекомендації з догляду'] },
  { id: 'brows', title: 'Архітектура та оформлення брів', group: 'gaze', price: 'від 700 ₴', duration: '1 год',
    description: 'Побудова форми брів за пропорціями обличчя: корекція, фарбування та ламінування.',
    includes: ['Розрахунок форми', 'Корекція воском або пінцетом', 'Фарбування хною чи фарбою'] },
];

export interface Master { id: string; name: string; role: string; about: string; serviceIds: ServiceId[] }
export const masters: Master[] = [
  { id: 'olena', name: 'Олена Коваль', role: 'Топ-майстер манікюру', about: '9 років досвіду. Авторські форми та мінімалістичний дизайн.', serviceIds: ['manicure', 'nail-extensions'] },
  { id: 'maria', name: 'Марія Іванюк', role: 'Майстер педикюру', about: 'Делікатний догляд і бездоганна чистота інструментів.', serviceIds: ['pedicure', 'manicure'] },
  { id: 'katerina', name: 'Катерина Бондар', role: 'Nail-майстер', about: 'Сучасний нейл-арт, чисте покриття та стійкі форми для щоденного носіння.', serviceIds: ['manicure', 'pedicure', 'nail-extensions'] },
  { id: 'sofia', name: 'Софія Мельник', role: 'Лешмейкер', about: 'Підбирає ефект під форму очей, від легкої класики до об’єму.', serviceIds: ['lash-extensions'] },
  { id: 'daryna', name: 'Дарина Шевчук', role: 'Архітектор брів', about: 'Будує форму за пропорціями обличчя. Працює також з віями.', serviceIds: ['brows', 'lash-extensions'] },
];

export const reviews = [
  { name: 'Анастасія К.', service: 'Нарощування нігтів', rating: 5, text: 'Нарешті форма, яка тримається п’ять тижнів без сколів. Олена одразу зрозуміла, що мені потрібно.' },
  { name: 'Ірина Д.', service: 'Брови', rating: 5, text: 'Дарина підібрала форму так, що обличчя виглядає відпочилим. Тепер ходжу лише до неї.' },
  { name: 'Вікторія Л.', service: 'Нарощування вій', rating: 5, text: 'Вії легкі, без відчуття ваги. Софія детально пояснила, як їх доглядати.' },
  { name: 'Олеся М.', service: 'Педикюр', rating: 4, text: 'Дуже спокійна атмосфера й акуратна робота. Єдине, що хочеться: більше вечірніх вікон.' },
];
