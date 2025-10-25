document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggler
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Set initial theme based on localStorage or system preference
  const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  htmlElement.classList.add(currentTheme);

  const updateThemeIcons = (theme) => {
    if (!themeToggle) return;
    const sunIcon = themeToggle.querySelector('.fa-sun');
    const moonIcon = themeToggle.querySelector('.fa-moon');
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  };
  
  updateThemeIcons(currentTheme);

  if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const newTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark';
        htmlElement.classList.remove('dark', 'light');
        htmlElement.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
      });
  }
});
