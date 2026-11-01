const pageTitles = { home: 'Beranda', materi: 'Materi', tugas: 'Tugas', jadwal: 'Jadwal', diskusi: 'Diskusi', tentang: 'Tentang kelas' };
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebarBackdrop');
const pageTitle = document.getElementById('pageTitle');

function openPage(page) {
  document.querySelectorAll('.page-section').forEach((section) => section.classList.toggle('active', section.id === `page-${page}`));
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.page === page));
  pageTitle.textContent = pageTitles[page] || 'Beranda';
  sidebar.classList.remove('open');
  backdrop.classList.remove('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (event) => {
  const pageButton = event.target.closest('[data-page]');
  if (pageButton) openPage(pageButton.dataset.page);
  const scrollButton = event.target.closest('[data-scroll]');
  if (scrollButton) document.getElementById(scrollButton.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('menuToggle').addEventListener('click', () => { sidebar.classList.add('open'); backdrop.classList.add('show'); });
backdrop.addEventListener('click', () => { sidebar.classList.remove('open'); backdrop.classList.remove('show'); });
document.getElementById('year').textContent = new Date().getFullYear();
