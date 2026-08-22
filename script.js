const opening = document.querySelector('#opening');
const content = document.querySelector('#siteContent');
const gallery = document.querySelector('#gallery');

// The gallery is available only through the private invitation URL below.
// This is intentional link-based access, not server-side photo protection.
const galleryAccessKey = 'n8Vq4mZ2rL7xK9dP5sW1cH6jT3yF0aB';
const hasGalleryAccess = new URLSearchParams(window.location.search).get('k') === galleryAccessKey;
if (!hasGalleryAccess) gallery?.remove();

// Do not restore the visitor's previous scroll position after a page refresh.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('pageshow', () => window.scrollTo(0, 0));

document.querySelector('#openInvitation').addEventListener('click', () => {
  window.scrollTo(0, 0);
  opening.classList.add('is-hidden');
  content.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = '';
});

const eventDate = new Date('2026-09-12T13:00:00+07:00').getTime();
function updateCountdown() {
  const distance = Math.max(0, eventDate - Date.now());
  const values = [
    Math.floor(distance / 86400000),
    Math.floor((distance % 86400000) / 3600000),
    Math.floor((distance % 3600000) / 60000),
    Math.floor((distance % 60000) / 1000)
  ];
  ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => {
    document.getElementById(id).textContent = String(values[index]).padStart(2, '0');
  });
}
updateCountdown(); setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver((entries) => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(item => observer.observe(item));

document.querySelectorAll('.tilt').forEach(card => card.addEventListener('pointermove', (e) => {
  if (matchMedia('(pointer: coarse)').matches) return;
  const box = card.getBoundingClientRect();
  const x = (e.clientX - box.left) / box.width - .5, y = (e.clientY - box.top) / box.height - .5;
  card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${y * -5}deg) translateY(-3px)`;
}));
document.querySelectorAll('.tilt').forEach(card => card.addEventListener('pointerleave', () => card.style.transform = ''));

const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('img');
document.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', () => { lightboxImage.src = item.dataset.image; lightbox.showModal(); }));
lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });

document.querySelector('.copy-button').addEventListener('click', async (e) => {
  await navigator.clipboard.writeText(e.currentTarget.dataset.copy);
  e.currentTarget.innerHTML = 'Nomor berhasil disalin ✓';
  setTimeout(() => e.currentTarget.innerHTML = 'Salin nomor rekening <span>⧉</span>', 2200);
});

const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxdnGVJbjJlWGZPqh3b3Xa_fINlVWm4tlfINIyUQXBtMlRlUslehyhVLE5zlLJOMqfPjA/exec';
const rsvpForm = document.querySelector('#rsvpForm');
const formNote = document.querySelector('#formNote');
const submitButton = rsvpForm.querySelector('button[type="submit"]');

rsvpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(rsvpForm);
  const payload = {
    guestOne: formData.get('guest_one').trim(),
    guestTwo: formData.get('guest_two').trim(),
    phone: formData.get('phone').trim(),
    attendance: formData.get('attendance'),
    message: formData.get('message').trim()
  };

  submitButton.disabled = true;
  submitButton.textContent = 'Mengirim...';
  formNote.textContent = '';

  try {
    // Apps Script redirects its response to a Google content domain. no-cors lets a
    // public static site submit safely without exposing the spreadsheet itself.
    await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    rsvpForm.reset();
    formNote.textContent = 'Terima kasih. Konfirmasi kehadiran Anda telah kami terima.';
  } catch (error) {
    formNote.textContent = 'Maaf, konfirmasi belum terkirim. Silakan coba lagi.';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Kirim konfirmasi <span>→</span>';
  }
});
