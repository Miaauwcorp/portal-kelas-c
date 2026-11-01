const pageTitles = { home: 'Beranda', materi: 'Materi', tugas: 'Tugas', jadwal: 'Jadwal', diskusi: 'Diskusi', tentang: 'Tentang kelas' };
const routes = { '/': 'home', '/materi': 'materi', '/tugas': 'tugas', '/jadwal': 'jadwal', '/diskusi': 'diskusi', '/tentang': 'tentang', '/assignments': 'home' };
const pageRoutes = { home: '/', materi: '/materi', tugas: '/tugas', jadwal: '/jadwal', diskusi: '/diskusi', tentang: '/tentang' };
const notionSources = {
  menu: 'https://wood-foundation-baf.notion.site/ebd//40bf5ba699fa80e5861ff254c4e10558',
  tugas: 'https://wood-foundation-baf.notion.site/ebd//3daf5ba699fa806cb66ff580f8eb1589?v=40bf5ba699fa80c585e3000c53ea7793'
};
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebarBackdrop');
const pageTitle = document.getElementById('pageTitle');

function setFocusMode(enabled, notionSource) {
  document.body.classList.toggle('notion-focus-mode', enabled);
  if (!enabled) return;
  const notionFrame = document.querySelector('.notion-card iframe');
  if (notionFrame) {
    const notionUrl = new URL(notionSource || notionFrame.src);
    notionUrl.searchParams.set('theme', 'light');
    if (notionFrame.src !== notionUrl.toString()) notionFrame.src = notionUrl.toString();
  }
}

function openPage(page, { updateUrl = true, focusMode = false, notionSource } = {}) {
  document.querySelectorAll('.page-section').forEach((section) => section.classList.toggle('active', section.id === `page-${page}`));
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.page === page));
  pageTitle.textContent = pageTitles[page] || 'Beranda';
  setFocusMode(focusMode, notionSource);
  if (updateUrl) history.pushState({ page }, '', pageRoutes[page] || '/');
  sidebar.classList.remove('open');
  backdrop.classList.remove('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function routeFromLocation() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (window.location.search.includes('deadlinetugas')) {
    history.replaceState({ page: 'home' }, '', '/assignments');
    openPage('home', { updateUrl: false, focusMode: true, notionSource: notionSources.tugas });
    return;
  }
  const page = routes[path] || 'home';
  openPage(page, { updateUrl: false, focusMode: path === '/assignments', notionSource: path === '/assignments' ? notionSources.tugas : undefined });
}

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-deadline-mode]')) return;
  const pageButton = event.target.closest('[data-page]');
  if (pageButton) {
    event.preventDefault();
    openPage(pageButton.dataset.page);
  }
  const scrollButton = event.target.closest('[data-scroll]');
  if (scrollButton) document.getElementById(scrollButton.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('menuToggle').addEventListener('click', () => { sidebar.classList.add('open'); backdrop.classList.add('show'); });
backdrop.addEventListener('click', () => { sidebar.classList.remove('open'); backdrop.classList.remove('show'); });
document.getElementById('year').textContent = new Date().getFullYear();
window.addEventListener('popstate', routeFromLocation);
routeFromLocation();
