// Project data for Mark's portfolio
const projectsData = {
  coding: [
    {
      id: 'prayer-app',
      title: 'Prayer Manager',
      description: 'This is a site that I am currently working on to manage our prayer chain at our church.',
      technologies: ['React', 'React Routing', 'Supabase', 'Supabase Authentication', "Typescript", "Tailwind CSS", "Resend API", "MailChimp API", "Planning Center API"],
      siteUrl: 'https://cp-church-prayer.netlify.app/',
      githubUrl: 'https://github.com/Kelemek/prayerapp',
      image: '',
      imageAlt: 'Prayer app using react and supabase'
    },
    {
      id: 'sales-dashboard',
      title: 'Sales Dashboard',
      description: 'This is a sales dashboard written in React with a Supabase backend. Also utilizing React routing and Supabase authentication.',
      technologies: ['React', 'React Routing', 'Supabase', 'Supabase Authentication'],
      siteUrl: 'https://react-salesdesktop.netlify.app/',
      githubUrl: 'https://github.com/Kelemek/react-salesdesktop',
      image: './images/react_salesdashboard.webp',
      imageAlt: 'Sales Dashboard built with React and Supabase'
    },
    {
      id: 'travel-api',
      title: 'My Travel API',
      description: 'This is a travel API written for Node.js but modified to run in Netlify.',
      technologies: ['Node.js', 'Javascript'],
      siteUrl: 'https://mytravelapi.netlify.app/',
      githubUrl: 'https://github.com/Kelemek/travelapi',
      image: './images/travelapi.webp',
      imageAlt: 'Travel API built for Node.js'
    },
    {
      id: 'typed-coding-endgame',
      title: 'Coding Endgame',
      description: 'This is a hangman style game written in React and TypeScript',
      technologies: ['HTML', 'CSS', 'React', 'Typescript'],
      siteUrl: 'https://typedendgame.netlify.app',
      githubUrl: 'https://github.com/Kelemek/Typescript_Endgame',
      image: './images/endgame.webp',
      imageAlt: 'Game of hangman built in React and typescript'
    },
    {
      id: 'tenzies-game',
      title: 'Game of Tenzies',
      description: 'This was a fun project to build in React.',
      technologies: ['HTML', 'CSS', 'React'],
      siteUrl: 'https://my-tenzies-dicegame.netlify.app/',
      githubUrl: 'https://github.com/Kelemek/react-tenzies',
      image: './images/tenzies.webp',
      imageAlt: 'Game of Tenzies built in React'
    },
    {
      id: 'digital-business-card',
      title: 'Digital Business Card',
      description: 'My first React solo project.',
      technologies: ['HTML', 'CSS', 'React'],
      siteUrl: 'https://marksdigitalbusinesscard.netlify.app/',
      githubUrl: 'https://github.com/Kelemek/digital-business-card',
      image: './images/reactdbc.webp',
      imageAlt: 'Marks digital business card built in React'
    },
    {
      id: 'movie-watchlist',
      title: 'Movie Watchlist',
      description: 'Search for the next movie you would like to see or create a list of your favorites. This app fetches data from OpenIMDB and lets you save your favorites to local storage.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'RESTful API'],
      siteUrl: 'https://mymoviefavorites.netlify.app/',
      githubUrl: 'https://github.com/Kelemek/moviewatchlist',
      image: './images/watchlist.webp',
      imageAlt: 'Search and save your favorite movies to a watchlist.'
    },
    {
      id: 'color-scheme-generator',
      title: 'Color Scheme Generator',
      description: 'Helpful tool to generate color schemes for your next coding project. Pick a base color and genterate a color scheme from it pulled from the Color API. You can also click on the colors and the hex code will be copied to your clipboard.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'RESTful API'],
      siteUrl: 'https://makecolorscheme.netlify.app/',
      githubUrl: 'https://github.com/Kelemek/colorschemegenerator',
      image: './images/color-generator.webp',
      imageAlt: 'Tool to generate color schemes based on a base color.'
    },
    {
      id: 'password-generator',
      title: 'Password Generator',
      description: 'Handy app that generates two secure random passwords. When you click a generated password it copies it to your clipboard.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      siteUrl: 'https://mypasswordgeneratorsite.netlify.app/',
      githubUrl: 'https://github.com/Kelemek/passwordgenerator',
      image: './images/password.webp',
      imageAlt: 'Password generator site with and without generated passwords.'
    },
    {
      id: 'favorites-tracker',
      title: 'Favorites Tracker',
      description: 'Bookmark your favorite sites to store them in a database. This app allows you to add and delete bookmarks that are persisted to a Firebase database.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Firebase'],
      siteUrl: 'https://my-leads-tracker-phone-app.netlify.app/',
      githubUrl: 'https://github.com/Kelemek/leadstrackerapp',
      image: './images/leads_tracker.webp',
      imageAlt: 'Favorites tracker website showing saved sites.'
    },
    {
      id: 'hometown-parks',
      title: 'Hometown Parks',
      description: 'Site that shows my favorite parks in my hometown of Cambridge, Minnesota.',
      technologies: ['HTML', 'CSS'],
      siteUrl: 'https://hometownparks.netlify.app/',
      githubUrl: 'https://github.com/Kelemek/HometownSite',
      image: './images/hometown.webp',
      imageAlt: 'Hometown parks website showing three favorite parks.'
    }
  ],
  
  drawing: [
    {
      id: 'mom-portrait',
      title: 'Mom',
      description: 'A portrait of my Mom drawn on my iPad using Procreate.',
      technologies: ['Procreate'],
      imageUrl: './images/mom.webp',
      image: './images/mom.webp',
      imageAlt: 'A portrait of my Mom drawn on my iPad using the Procreate.'
    },
    {
      id: 'butterfly-drawing',
      title: 'Butterfly',
      description: 'A drawing of a photo my son took.',
      technologies: ['Procreate'],
      imageUrl: './images/butterfly.webp',
      image: './images/butterfly.webp',
      imageAlt: 'A drawing of a butterfly photo my son took.'
    },
    {
      id: 'gracie-portrait',
      title: 'Gracie',
      description: 'A portrait of my daughter\'s cat that I drew on my iPad.',
      technologies: ['Procreate'],
      imageUrl: './images/Gracie.webp',
      image: './images/Gracie.webp',
      imageAlt: 'A drawing of a picture my son took that I drew on my iPad using the Procreate.'
    },
    {
      id: 'grace-portrait',
      title: 'Grace',
      description: 'A portrait of my daughter\'s cat saying "Dont look at me!".',
      technologies: ['Procreate'],
      imageUrl: './images/Grace.webp',
      image: './images/Grace.webp',
      imageAlt: 'A portrait of my daughter\'s cat that I drew on my iPad.'
    }
  ]
};