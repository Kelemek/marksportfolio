/* -----------------------------------------
  Portfolio Configuration
 ---------------------------------------- */

// Configuration: Set default display mode for coding projects
// Options: 'iframe' or 'image'
const DEFAULT_PROJECT_MODE = 'iframe'; // Change to 'image' to default to static images

/* -----------------------------------------
  Have focus outline only for keyboard users 
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if(e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing')

    window.removeEventListener('keydown', handleFirstTab)
    window.addEventListener('mousedown', handleMouseDownOnce)
  }

}

const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing')

  window.removeEventListener('mousedown', handleMouseDownOnce)
  window.addEventListener('keydown', handleFirstTab)
}

window.addEventListener('keydown', handleFirstTab)

/* -----------------------------------------
  Scroll-based Navigation Animation
 ---------------------------------------- */

window.addEventListener("scroll", () => {
  // Navigation scroll effect - progressive transition

// Get navigation element
const nav = document.querySelector('.nav');
  const scrollY = window.scrollY;
  const maxScroll = 300; // Distance over which to complete the transition
  
  // Calculate progress (0 to 1)
  const progress = Math.min(scrollY / maxScroll, 1);
  
  // Apply progressive styles based on scroll progress
  nav.style.setProperty('--scroll-progress', progress);
  
  // Add class for any additional styling if needed
  if (progress > 0.05) {
    nav.classList.add('nav--scrolled');
  } else {
    nav.classList.remove('nav--scrolled');
  }
});

/* -----------------------------------------
  Project Rendering Functions
 ---------------------------------------- */

// Function to render a coding project work box
function renderCodingProject(project) {
  const uniqueId = `iframe-${project.id}`;

  // Directly render based on the effective mode - no progressive loading
  const imageBoxContent = DEFAULT_PROJECT_MODE === 'iframe' 
    ? renderIframeContent(project, uniqueId)
    : renderImageContent(project);
  
  return `
    <div class="work__box">
      <div class="work__text">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <ul class="work__list">
          ${project.technologies.map(tech => `<li>${tech}</li>`).join('')}
        </ul>
        <div class="work__links">
          <a href="${project.siteUrl}" class="link__text" target="_blank">
            Visit Site <span>&rarr;</span>
          </a>
          <a href="${project.githubUrl}" target="_blank">
            <img src="./images/github.svg" class="work__code" title="View Source Code" alt="GitHub">
          </a>
        </div>
      </div>
      <div class="work__image-box" id="container-${project.id}">
        ${imageBoxContent}
      </div>
    </div>
  `;
}



// Render iframe content
function renderIframeContent(project, uniqueId) {
  return `
    <iframe 
      id="${uniqueId}"
      src="${project.siteUrl}" 
      class="work__iframe"
      title="${project.title} - Interactive Demo"
      loading="lazy"
      referrerpolicy="same-origin"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
    ></iframe>
  `;
}

// Render image content
function renderImageContent(project) {
  return `
    <a href="${project.siteUrl}" target="_blank">
      <img src="${project.image}" class="work__image" alt="${project.imageAlt}" />
    </a>
  `;
}

// Function to render a drawing project work box
function renderDrawingProject(project) {
  return `
    <div class="work__box">
      <div class="work__text">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <ul class="work__list">
          ${project.technologies.map(tech => `<li>${tech}</li>`).join('')}
        </ul>
        <div class="work__links">
          <a href="${project.imageUrl}" class="link__text" target="_blank">
            View Drawing <span>&rarr;</span>
          </a>
        </div>
      </div>
      <div class="work__image-box">
        <a href="${project.imageUrl}" target="_blank">
          <img src="${project.image}" class="work__image" alt="${project.imageAlt}" />
        </a>
      </div>
    </div>
  `;
}

// Function to render all projects
function renderProjects() {
  // Render coding projects
  const codingContainer = document.querySelector('#work .work__boxes');
  if (codingContainer && projectsData && projectsData.coding) {
    codingContainer.innerHTML = projectsData.coding.map(renderCodingProject).join('');
  }

  // Render drawing projects
  const drawingContainer = document.querySelector('#drawing .work__boxes');
  if (drawingContainer && projectsData && projectsData.drawing) {
    drawingContainer.innerHTML = projectsData.drawing.map(renderDrawingProject).join('');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
});
