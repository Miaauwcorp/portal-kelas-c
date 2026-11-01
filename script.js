const pageTitles = { home: 'Beranda', materi: 'Materi', tugas: 'Tugas', jadwal: 'Jadwal', diskusi: 'Diskusi', tentang: 'Tentang kelas' };
const routes = { '/': 'home', '/materi': 'materi', '/tugas': 'tugas', '/jadwal': 'jadwal', '/diskusi': 'diskusi', '/tentang': 'tentang', '/assignements': 'home' };
const pageRoutes = { home: '/', materi: '/materi', tugas: '/tugas', jadwal: '/jadwal', diskusi: '/diskusi', tentang: '/tentang' };
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebarBackdrop');
const pageTitle = document.getElementById('pageTitle');

function setFocusMode(enabled) {
  document.body.classList.toggle('notion-focus-mode', enabled);
  if (!enabled) return;
  const notionFrame = document.querySelector('.notion-card iframe');
  if (notionFrame && !notionFrame.src.includes('theme=light')) {
    const notionUrl = new URL(notionFrame.src);
    notionUrl.searchParams.set('theme', 'light');
    notionFrame.src = notionUrl.toString();
  }
}

function openPage(page, { updateUrl = true, focusMode = false } = {}) {
  document.querySelectorAll('.page-section').forEach((section) => section.classList.toggle('active', section.id === `page-${page}`));
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.page === page));
  pageTitle.textContent = pageTitles[page] || 'Beranda';
  setFocusMode(focusMode);
  if (updateUrl) history.pushState({ page }, '', pageRoutes[page] || '/');
  sidebar.classList.remove('open');
  backdrop.classList.remove('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function routeFromLocation() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (window.location.search.includes('deadlinetugas')) {
    history.replaceState({ page: 'home' }, '', '/assignements');
    openPage('home', { updateUrl: false, focusMode: true });
    return;
  }
  const page = routes[path] || 'home';
  openPage(page, { updateUrl: false, focusMode: path === '/assignements' });
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
