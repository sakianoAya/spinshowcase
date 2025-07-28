# SpineShowcase

A professional Spine2D animation showcase platform built with Next.js and WebGL.

## Features

- 🎮 **Interactive Spine2D Viewer** - Real-time animation playback with WebGL rendering
- 🎨 **Model Management** - Add, edit, and organize your Spine models
- 🔧 **Animation Controls** - Play, pause, speed control, and animation switching
- 🎭 **Skin System** - Dynamic skin switching for supported models
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🌙 **Dark Theme** - Professional dark interface
- 💾 **Local Storage** - Persistent model configurations
- 📤 **Import/Export** - Backup and restore your model collections

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **3D Rendering**: Spine WebGL 4.2.27
- **UI Components**: Radix UI
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/sakianoAya/spineshowcase.git
cd spineshowcase
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding Models

1. Click the "Add New Model" button in the left sidebar
2. Fill in the model information:
   - **Name**: Display name for your model
   - **Description**: Brief description
   - **Thumbnail**: Preview image URL
   - **Atlas File**: Spine atlas file URL (.atlas)
   - **JSON File**: Spine skeleton data URL (.json)
   - **PNG File**: Texture image URL (.png)

3. Use GitHub raw URLs for remote files:
\`\`\`
https://raw.githubusercontent.com/username/repository/branch/path/file.ext
\`\`\`

### Controls

- **Mouse Drag**: Pan the view
- **Mouse Wheel**: Zoom in/out
- **Animation Dropdown**: Switch between available animations
- **Skin Dropdown**: Change character skins (if available)
- **Speed Slider**: Adjust playback speed
- **Debug Toggle**: Show/hide skeleton wireframes

### Model Management

- **Edit**: Swipe left on any model to access edit options
- **Delete**: Swipe left and tap delete (with confirmation)
- **Export**: Download your model configuration as JSON
- **Import**: Upload a previously exported configuration
- **Reset**: Restore default models

## File Structure

\`\`\`
spineshowcase/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # Reusable UI components
│   ├── SpineCanvas.tsx  # WebGL canvas component
│   ├── WorksList.tsx    # Model list sidebar
│   ├── ControlPanel.tsx # Animation controls
│   └── ...
├── hooks/
│   ├── useSpineEngine.ts    # Spine WebGL integration
│   └── useModelStorage.ts   # Local storage management
├── public/
│   ├── assets/          # Default model files
│   └── spine-models.json # Default model configuration
└── ...
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with default settings

### Manual Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

- **Portfolio**: [han-portfoliogamestyle.vercel.app](https://han-portfoliogamestyle.vercel.app/conact)
- **Email**: aya871210@gmail.com
- **GitHub**: [@sakianoAya](https://github.com/sakianoAya)

## Acknowledgments

- [Spine Runtime](https://github.com/EsotericSoftware/spine-runtimes) - 2D skeletal animation
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animation library
