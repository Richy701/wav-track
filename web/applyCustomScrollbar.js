function applyCustomScrollbar() {
  const isWebkit = 'WebkitAppearance' in document.documentElement.style;
  const elements = document.querySelectorAll('.scrollable-element');

  elements.forEach((element) => {
    if (isWebkit) {
      element.style.setProperty('scrollbar-width', 'thin');
      element.style.setProperty('scrollbar-color', '#888 #fff');
    } else {
      // Fallback for non-WebKit browsers
      element.style.overflow = 'auto';
    }
  });
}

document.addEventListener('DOMContentLoaded', applyCustomScrollbar);
