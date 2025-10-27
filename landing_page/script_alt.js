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

  // Animated Typing Effect
  const typingTarget = document.getElementById('typing-target');
  if (typingTarget) {
    const ideas = [
      "a script to find all files larger than 1GB and export to a CSV",
      "a script to organize my downloads folder by file type",
      "a script to check a list of servers and email me if any are down",
      "a script to rename a batch of photos with the date they were taken",
      "a script to create a new Azure VM for a web server",
      "a script to get all AD users who haven't logged in for 90 days"
    ];
    let ideaIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      const currentIdea = ideas[ideaIndex];
      
      if (isDeleting) {
        typingTarget.textContent = currentIdea.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingTarget.textContent = currentIdea.substring(0, charIndex + 1);
        charIndex++;
      }

      let typingSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === currentIdea.length) {
        // Pause at the end
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        ideaIndex = (ideaIndex + 1) % ideas.length;
         // Pause before starting next
        typingSpeed = 500;
      }

      setTimeout(type, typingSpeed);
    };

    type();
  }
});