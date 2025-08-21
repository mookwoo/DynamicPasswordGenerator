# SecurePass - Dynamic Password Generator

A modern, feature-rich password generator with mood-based generation, theme support, and secure password management. This application creates secure, customizable passwords using advanced algorithms and provides a beautiful, responsive interface.

## 🌟 Features

### Password Generation
- **Mood-based Generation**: Choose from Happy, Fierce, Calm, Dark, or Creative moods
- **Theme Support**: Fantasy, Sci-Fi, Professional, Nature, and Random themes
- **Customizable Length**: 8-64 characters with visual slider
- **Character Types**: Include/exclude numbers, symbols, uppercase, and lowercase
- **API Integration**: Uses Datamuse API with local fallbacks for reliability
- **Smart Word Combinations**: Combines adjectives and nouns contextually

### User Interface
- **Modern Design**: Clean, professional interface with CSS Grid/Flexbox
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: Full keyboard navigation and screen reader support
- **Visual Feedback**: Password strength indicator and generation alerts

### Password Management
- **History Tracking**: Keep track of recently generated passwords
- **Save Functionality**: Store passwords with titles and metadata (demo mode)
- **Search & Filter**: Find saved passwords quickly
- **Export Options**: Copy passwords to clipboard with one click
- **Mood Context**: View generation settings for each password

### Security Features
- **Client-side Generation**: Passwords generated locally for privacy
- **No Server Dependencies**: Works completely offline after initial load
- **Secure Storage**: Uses browser localStorage for demo functionality
- **Input Validation**: Comprehensive client-side validation

## 🚀 Live Demo

**GitHub Pages**: [https://mookwoo.github.io/DynamicPasswordGenerator](https://mookwoo.github.io/DynamicPasswordGenerator)

## 🛠 Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling**: CSS Custom Properties, CSS Grid, Flexbox
- **Icons**: Feather Icons
- **Fonts**: Inter (UI), JetBrains Mono (passwords)
- **API**: Datamuse API for word generation
- **Backend** (optional): Node.js, Express, SQLite, JWT authentication

## 📱 Usage

### Quick Start
1. Visit the [live demo](https://mookwoo.github.io/DynamicPasswordGenerator)
2. Choose your preferred mood and theme
3. Adjust password length and character types
4. Click "Generate Password"
5. Copy or save your secure password

### Demo Authentication
- **Login**: Enter any email and password to access demo mode
- **Registration**: Create a demo account with any credentials
- **Features**: Full password management in localStorage (demo only)

### Password Generation Tips
- **Happy mood**: Generates cheerful words with bright themes
- **Fierce mood**: Creates strong, powerful combinations
- **Calm mood**: Produces peaceful, serene passwords
- **Dark mood**: Uses mysterious, gothic elements
- **Creative mood**: Combines artistic and imaginative words

## 🔧 Local Development

### Frontend Only (GitHub Pages Version)
```bash
# Clone the repository
git clone https://github.com/mookwoo/DynamicPasswordGenerator.git
cd DynamicPasswordGenerator

# Open in browser
open index.html
# or serve with a local server
python -m http.server 8000
# or
npx serve .
```

### Full Stack Development
```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
DynamicPasswordGenerator/
├── index.html              # Main application page
├── styles.css              # Modern CSS with themes
├── script.js               # Frontend application logic
├── package.json            # Node.js dependencies
├── server.js               # Express server (optional)
├── database/
│   └── init.js            # Database initialization
├── .env                    # Environment variables
└── README.md              # This file
```

## 🔐 Security Notes

- Passwords are generated client-side for maximum privacy
- No passwords are transmitted over the network during generation
- Demo mode uses localStorage - not suitable for production use
- For production use, implement the full backend with proper encryption

## 🌍 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, issues, or feature requests, please open an issue on GitHub.

## 🔄 Version History

- **v1.0.0**: Initial release with basic password generation
- **v2.0.0**: Added mood-based generation and modern UI
- **v2.1.0**: Enhanced themes and responsive design
- **v2.2.0**: Added password management and GitHub Pages support

---

**Made with ❤️ for secure password generation**
