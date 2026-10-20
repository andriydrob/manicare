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
  { id: 'alona', name: 'Альона', role: 'Молодший майстер манікюру', about: 'Проходила навчання та стажування у нашій студії. Авторські форми та мінімалістичний дизайн.', serviceIds: ['manicure', 'nail-extensions'] },
  { id: 'katerina1', name: 'Катерина ', role: 'ТОП майстер манікюру', about: '20+ років досвіду. Сучасний нейл-арт, чисте покриття та стійкі форми для щоденного носіння.', serviceIds: ['manicure', 'pedicure', 'nail-extensions'] },
  { id: 'liza', name: 'Ліза', role: 'Майстер манікюру', about: '3+ років досвіду. Делікатний догляд і бездоганна чистота інструментів.', serviceIds: ['nail-extensions', 'manicure'] },
  { id: 'katerina2', name: 'Катерина', role: 'Молодший майстер манікюру', about: 'Підбирає ефект під форму очей, від легкої класики до об’єму.', serviceIds: ['nail-extensions', 'manicure'] },
  { id: 'daryna', name: 'Дарина Шевчук', role: 'Архітектор брів', about: 'Будує форму за пропорціями обличчя. Працює також з віями.', serviceIds: ['brows', 'lash-extensions'] },
];

export const reviews = [
  { name: 'Катя С.', service: 'Нарощування нігтів', rating: 5, text: 'Дуже гарний манікюр, раджу❤️❤️❤️' },
  { name: 'Anastasiia', service: 'Манікюр', rating: 5, text: 'Гарний салон із високим рівнем обслуговування. І ще й дуже гарний!' },
  { name: 'Світлана С.', service: 'Манікюр', rating: 5, text: 'Дуже професійні майстри, вже кілька років роблю манікюр і педикюр, раджу — чудове співвідношення ціни та якості.' },
  { name: 'Olha B.', service: 'Манікюр', rating: 5, text: 'Я дуже задоволена сервісом у салоні Manicare! 😊Майстриня завжди уважна до деталей, пропонує свої варіанти дизайну, підтримує мої ідеї та враховує мої побажання. Подобається затишна атмосфера та чистота. Манікюр у мене протримався понад два тижні без відколів. Залишаюся вірною улюбленому салону і рекомендую його вам😇' },
  { name: 'Margi Y.', service: 'Педикюр', rating: 5, text: 'Постійно ходжу на манікюр і завжди задоволена результатом 🩷' },
];

export const shortTitle: Record<ServiceId, string> = {
  manicure: 'Манікюр', pedicure: 'Педикюр', 'nail-extensions': 'Нарощування нігтів', 'lash-extensions': 'Вії', brows: 'Брови',
};
