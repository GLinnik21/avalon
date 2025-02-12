import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { routesSeo } from '@/router/seo';
import type { TMultiLangRoute, TNormalizedLangRoute } from '@/router/seo';
import Lobby from '@/pages/lobby/Lobby.vue';
import cloneDeep from 'lodash/cloneDeep';
import { TLanguage, LanguageMap } from '@/helpers/i18n';

const routeComponentMap = {
  lobby: Lobby,
  wiki: () => import('@/pages/wiki/Index.vue'),
  notFound: () => import('@/pages/empty/NotFound.vue'),
  room: () => import('@/pages/room/Room.vue'),
  roles: () => import('@/pages/wiki/roles/Index.vue'),
  expansions: () => import('@/pages/wiki/addons/Index.vue'),
  lancelots: () => import('@/pages/wiki/roles/Lancelots.vue'),
  lady_of_lake: () => import('@/pages/wiki/addons/LadyOfTheLake.vue'),
  lady_of_sea: () => import('@/pages/wiki/addons/LadyOfTheSea.vue'),
  excalibur: () => import('@/pages/wiki/addons/Excalibur.vue'),
  morgana: () => import('@/pages/wiki/roles/Morgana.vue'),
  percival: () => import('@/pages/wiki/roles/Percival.vue'),
  rules: () => import('@/pages/wiki/Rules.vue'),
  lovers: () => import('@/pages/wiki/roles/Lovers.vue'),
  merlin: () => import('@/pages/wiki/roles/Merlin.vue'),
  about: () => import('@/pages/about/About.vue'),
  oberon: () => import('@/pages/wiki/roles/Oberon.vue'),
  mordred: () => import('@/pages/wiki/roles/Mordred.vue'),
  troublemaker: () => import('@/pages/wiki/roles/Troublemaker.vue'),
  trickster: () => import('@/pages/wiki/roles/Trickster.vue'),
  witch: () => import('@/pages/wiki/roles/Witch.vue'),
  brute: () => import('@/pages/wiki/roles/Brute.vue'),
  lunatic: () => import('@/pages/wiki/roles/Lunatic.vue'),
  guinevere: () => import('@/pages/wiki/roles/Guinevere.vue'),
  merlin_pure: () => import('@/pages/wiki/roles/MerlinPure.vue'),
  servant: () => import('@/pages/wiki/roles/Servant.vue'),
  minion: () => import('@/pages/wiki/roles/Minion.vue'),
  cleric: () => import('@/pages/wiki/roles/Cleric.vue'),
  revealer: () => import('@/pages/wiki/roles/Revealer.vue'),
};

export const routes: Array<RouteRecordRaw> = [
  { path: '/wiki/roles/isolde/', name: 'isolde', redirect: { name: 'lovers' } },
  { path: '/wiki/roles/tristan/', name: 'tristan', redirect: { name: 'lovers' } },
  { path: '/wiki/roles/evil_lancelot/', name: 'evil_lancelot', redirect: { name: 'lancelots' } },
  { path: '/wiki/roles/good_lancelot/', name: 'good_lancelot', redirect: { name: 'lancelots' } },
  { path: '/:catchAll(.*)', redirect: '404' },
];

Object.values(routesSeo).forEach((route) => {
  if ('multiLanguage' in route.meta && route.meta.multiLanguage) {
    const multiLangRoute = <TMultiLangRoute>route;

    routes.push(
      ...[...Object.keys(multiLangRoute.meta.multiLanguage), ''].map((lang) => {
        const clone = cloneDeep(multiLangRoute);
        const langNormalized = lang.toLowerCase();

        // @ts-ignore
        delete clone.meta.multiLanguage;

        // @ts-ignore
        (<TNormalizedLangRoute>(<unknown>clone)).meta = {
          ...clone.meta,
          availableLocales: <TLanguage[]>Object.keys(multiLangRoute.meta.multiLanguage),
          lang: <TLanguage>langNormalized || 'en',
          id: clone.name,
          ...multiLangRoute.meta.multiLanguage[<TLanguage>lang || 'en'],
        };

        clone.name += langNormalized;

        if (langNormalized) {
          clone.path = `/${langNormalized}${clone.path}`;
        }

        return <RouteRecordRaw>{ ...clone, component: routeComponentMap[<keyof typeof routeComponentMap>route.name] };
      }),
    );
  }
});

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

const defaultKeywords: { [key in Lowercase<TLanguage>]: string[] } = {
  en: ['The Resistance', 'Avalon', 'Online', 'Board Game'],
  ru: ['Сопротивление', 'Авалон', 'Онлайн', 'Настольная Игра'],
  'zh-tw': ['反抗勢力', '亞瓦隆', '在線', '桌遊'],
  'zh-cn': ['反抗组织', '阿瓦隆', '在线', '桌游'],
  es: ['La Resistencia', 'Avalon', 'En línea', 'Juego de mesa'],
};

router.beforeEach((to, from, next) => {
  let toLangName = to.path.split('/')[1].toLowerCase();
  const documentLang = document.documentElement.lang.toLowerCase();

  if (Object.keys(LanguageMap).find((el) => el.toLowerCase() === toLangName) && toLangName !== documentLang) {
    const path = to.path.split('/').splice(2);
    next(path.join('/'));
    return;
  }

  let meta = to.meta;

  if (to.meta.lang === 'en' && documentLang !== 'en') {
    meta =
      routes.find((route) => {
        if (route.meta?.id !== meta.id) {
          return false;
        }

        return route.meta?.lang && documentLang === (<string>route.meta.lang).toLowerCase();
      })?.meta || meta;
  }

  const keywords = <string[]>meta.keywords ?? [];
  const image = <string>meta.image || 'roles/merlin.webp';
  const url = 'https://avalon-game.com';

  document.querySelector('head meta[property="og:image"]')!.setAttribute('content', `${url}/static/${image}`);

  document.title = <string>meta.title;
  document.querySelector('head meta[property="og:title"]')!.setAttribute('content', <string>meta.title);

  document.querySelector('head meta[name="description"]')!.setAttribute('content', <string>meta.description);
  document.querySelector('head meta[property="og:description"]')!.setAttribute('content', <string>meta.description);

  document
    .querySelector('head meta[name="keywords"]')!
    // @ts-ignore
    .setAttribute('content', [...keywords, ...defaultKeywords[(meta.lang || 'en').toLowerCase()]].join(', '));

  document.querySelector('link[rel="canonical"]')!.setAttribute('href', url + to.path);
  document.querySelector('head meta[property="og:url"]')!.setAttribute('content', url + to.path);

  const existingLinks = document.querySelectorAll('link[rel="alternate"]');
  existingLinks.forEach((link) => link.parentNode?.removeChild(link));

  if (meta.availableLocales) {
    const path = to.path.toLowerCase();

    (<Array<string>>meta.availableLocales).forEach((language) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = language;

      const langString = `/${(<string>meta.lang).toLowerCase()}`;
      const langInUrl = `/${language}`.toLowerCase();

      if (path.includes(langString)) {
        link.href = url + path.replace(langString, langInUrl);
      } else {
        link.href = url + langInUrl + path;
      }

      document.head.appendChild(link);
    });

    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = 'x-default';
    link.href = url + path.replace(`/${(<string>meta.lang).toLowerCase()}`, '');
    document.head.appendChild(link);
  }

  next();
});

export default router;
