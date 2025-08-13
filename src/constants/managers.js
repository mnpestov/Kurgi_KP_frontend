import PeterPhoto from '../images/PeterPhoto.jpg';
import PavelPhoto from '../images/PavelPhoto.jpg';

export const MANAGERS = {
  peter: {
    photo: PeterPhoto,
    name: 'Петр Кург',
    job: 'Руководитель проекта',
    email: 'kurgi-bar@yandex.ru',
    tel: '+7 925 516-31-16',
  },
  pavel: {
    photo: PavelPhoto,
    name: 'Павел Кург',
    job: 'Руководитель проекта',
    email: 'kurgi-bar@yandex.ru',
    tel: '+7 925 516-31-16',
  },
};

// Выбрать ключ по formData (сначала manager, потом по имени)
export const resolveManagerKey = (managerName) => {
  return String(managerName || '').startsWith('Павел') ? 'pavel' : 'peter';
};

export const getManagerPhoto = (formData) => {
  const key = resolveManagerKey(formData);
  return MANAGERS[key].photo;
};
