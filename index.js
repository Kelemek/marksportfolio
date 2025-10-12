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
  
  // Always start with image, then upgrade to iframe if available
  const imageBoxContent = DEFAULT_PROJECT_MODE === 'iframe' 
    ? renderImageWithLoadingIndicator(project, uniqueId)
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

// Render image first with loading indicator
function renderImageWithLoadingIndicator(project, uniqueId) {
  return `
    <div class="loading-placeholder" id="placeholder-${project.id}">
      <a href="${project.siteUrl}" target="_blank">
        <img src="${project.image}" class="work__image" alt="${project.imageAlt}" />
      </a>
      <div class="loading-indicator">
        <div class="loading-text">Loading interactive version...</div>
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

// Handle iframe loading success/failure
function handleIframeLoad(iframeId, fallbackImage, imageAlt, siteUrl) {
  // Check if iframe loaded successfully by trying to access its content
  const iframe = document.getElementById(iframeId);
  
  // Set a timeout to check if the iframe is actually loading content
  setTimeout(() => {
    try {
      // If we can't access the iframe or it's blank, fall back to image
      if (!iframe.contentWindow || iframe.contentWindow.location.href === 'about:blank') {
        replaceWithImage(iframeId, fallbackImage, imageAlt, siteUrl);
      }
    } catch (e) {
      // Cross-origin restriction means the site loaded successfully
      // This is expected behavior for external sites
    }
  }, 5000); // Wait 5 seconds to see if site loads
}

function handleIframeError(iframeId, fallbackImage, imageAlt, siteUrl) {
  replaceWithImage(iframeId, fallbackImage, imageAlt, siteUrl);
}

function replaceWithImage(iframeId, fallbackImage, imageAlt, siteUrl) {
  const iframe = document.getElementById(iframeId);
  if (iframe) {
    const imageContainer = iframe.parentElement;
    imageContainer.innerHTML = `
      <a href="${siteUrl}" target="_blank">
        <img src="${fallbackImage}" class="work__image" alt="${imageAlt}" />
      </a>
    `;
  }
}

// Check iframe availability with fetch (for sites that allow it)
async function checkSiteAvailability(url) {
  try {
    const response = await fetch(url, { 
      method: 'HEAD', 
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true; // If no error, assume site is available
  } catch (error) {
    return false; // Site is not available
  }
}

// Replace image with iframe when site becomes available
function upgradeToIframe(project) {
  const container = document.getElementById(`container-${project.id}`);
  const uniqueId = `iframe-${project.id}`;
  
  if (container) {
    // Create iframe content
    const iframeContent = renderIframeContent(project, uniqueId);
    
    // Replace placeholder with iframe
    container.innerHTML = iframeContent;
    
    // Set up error handling for the new iframe
    setTimeout(() => {
      const iframe = document.getElementById(uniqueId);
      if (iframe) {
        iframe.addEventListener('error', () => {
          // If iframe fails to load, revert to image
          container.innerHTML = renderImageContent(project);
        });
      }
    }, 100);
  }
}

// Check if site is available and upgrade to iframe
async function checkAndUpgradeToIframe(project) {
  try {
    // Create a hidden iframe to test loading
    const testIframe = document.createElement('iframe');
    testIframe.style.display = 'none';
    testIframe.src = project.siteUrl;
    
    return new Promise((resolve) => {
      let resolved = false;
      
      // Success handler
      const handleLoad = () => {
        if (!resolved) {
          resolved = true;
          document.body.removeChild(testIframe);
          resolve(true);
        }
      };
      
      // Error handler
      const handleError = () => {
        if (!resolved) {
          resolved = true;
          document.body.removeChild(testIframe);
          resolve(false);
        }
      };
      
      // Timeout handler - assume success if no error after 8 seconds
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          document.body.removeChild(testIframe);
          resolve(true); // Assume it loaded successfully
        }
      }, 8000);
      
      testIframe.addEventListener('load', handleLoad);
      testIframe.addEventListener('error', handleError);
      
      document.body.appendChild(testIframe);
    });
  } catch (error) {
    return false;
  }
}

// Enhanced iframe loading with progressive upgrade
async function setupProgressiveIframeLoading() {
  if (DEFAULT_PROJECT_MODE !== 'iframe' || !projectsData || !projectsData.coding) {
    return;
  }
  
  // Process each coding project
  for (const project of projectsData.coding) {
    // Add a small delay between checks to avoid overwhelming the network
    setTimeout(async () => {
      const isAvailable = await checkAndUpgradeToIframe(project);
      
      if (isAvailable) {
        // Site is available, upgrade to iframe
        upgradeToIframe(project);
      }
      // If not available, keep showing the image (which is already displayed)
    }, Math.random() * 2000); // Random delay 0-2 seconds to stagger requests
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
  
  // Start progressive iframe loading after a short delay
  if (DEFAULT_PROJECT_MODE === 'iframe') {
    setTimeout(setupProgressiveIframeLoading, 1000);
  }
});
