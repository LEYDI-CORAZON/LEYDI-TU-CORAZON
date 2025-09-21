# Private & Pro - Premium Content Website

## Overview
This is a Spanish-language premium content website with age verification, subscription plans, and content catalog features. The project was imported from GitHub and has been successfully set up to run in the Replit environment.

## Recent Changes (September 21, 2025)
- Fixed corrupted HTML file by completing missing body content and structure
- Fixed JavaScript syntax errors and completed missing modal functionality
- Set up HTTP server workflow on port 5000 
- Configured deployment settings for static website hosting
- Added complete modal functionality for sign-in and subscription
- **MAJOR UPDATE**: Completely redesigned CSS with professional animations and transitions:
  - Premium dark theme with sophisticated color palette and gradients
  - Smooth animations and micro-interactions throughout
  - Glassmorphism effects and backdrop blur
  - Responsive design optimized for all devices
  - Accessibility support with prefers-reduced-motion
  - Professional button styles with hover effects
  - Enhanced modals with smooth transitions
  - Animated background particles and floating elements

## Project Architecture
- **Frontend**: Pure HTML, CSS, and JavaScript static website
- **Server**: Simple HTTP server serving static files
- **Port**: 5000 (configured for Replit environment)
- **Deployment**: Autoscale deployment target configured

## Key Features
- Age gate verification system
- Premium content catalog with mock data
- Three subscription plan tiers (Basic, Premium, VIP)
- Modal dialogs for sign-in and subscription
- Search functionality for content
- Responsive design with modern dark theme
- FAQ and contact sections

## Technical Stack
- HTML5 with semantic structure
- CSS3 with custom properties and responsive design
- Vanilla JavaScript for interactivity
- No build process required (static files)
- HTTP server for serving content

## Dependencies
- Node.js (runtime environment)
- http-server package for static file serving

## Project Structure
```
/
├── index.html          # Main HTML file with complete page structure
├── script.js           # JavaScript functionality for modals and interactions
├── style.css           # CSS styling with modern dark theme
├── package.json        # Node.js package configuration
└── replit.md          # This documentation file
```

## User Preferences
- Project uses Spanish language throughout
- Dark theme design preferred
- Premium/subscription-based content model
- Age-gated content for 18+ users
- Modern, clean UI design

## Development Notes
- Website is fully functional with all modals working
- Content uses placeholder images from picsum.photos
- All JavaScript event handlers are properly implemented
- Age verification uses sessionStorage for persistence
- Keyboard navigation supported (ESC key closes modals)