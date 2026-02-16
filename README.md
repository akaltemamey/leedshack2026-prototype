# **🚀 Orbital Launch Risk Assessment Platform (LeedsHack 2026 Prototype)**

A comprehensive mission control dashboard for planning space launches, analyzing orbital debris risks, and predicting weather conditions for safe atmospheric exit. This prototype was developed for LeedsHack 2026.


## **✨ Key Features**

- **🌍 Interactive 3D Globe Visualization**: Visualizes satellite orbits, debris fields, and potential launch trajectories in real-time.

- **📊 Dynamic Risk Assessment Engine**: Calculates collision probabilities based on altitude, inclination, and debris density.

- **wx Weather Prediction Model**: Python-based backend integration for analyzing launch window weather conditions (wind shear, precipitation, visibility).

- **🚀 Launch Profile Configuration**: Customizable inputs for payload mass, target orbit, launch vehicle type, and launch site coordinates.

- **📈 Data Visualization**: Interactive charts for altitude risk profiles, debris density heatmaps, and success probability trends.

- **📝 Automated Recommendations**: AI-driven suggestions for optimizing launch windows and trajectories to minimize risk.


## **🛠️ Tech Stack**

### **Frontend**

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)

- **Language**: TypeScript

- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

- **UI Library**: [Shadcn/ui](https://ui.shadcn.com/)

- **Icons**: [Lucide React](https://lucide.dev/)

- **Visualization**: Three.js / React Three Fiber (implied for Globe components)

- **Charting**: Recharts


### **Backend / Data Science**

- **Language**: Python 3.13+

- **Logic**: Custom Risk Engine & Weather Prediction Models (/model)

- **Database**: SQLite (for caching orbital data)

- **External APIs**: CelesTrak (Satellite Data), Weather APIs


## **📂 Project Structure**

├── app/                  # Next.js App Router pages and API routes\
│   ├── api/              # Backend endpoints (Risk, Weather, CelesTrak)\
│   └── page.tsx          # Main dashboard entry point\
├── components/           # React UI components\
│   ├── ui/               # Reusable primitive components (Shadcn)\
│   ├── globe-visualization.tsx  # 3D Globe logic\
│   └── ...               # Domain-specific components (Charts, Forms)\
├── lib/                  # Utility functions and core logic\
│   ├── risk-engine.ts    # JS implementation of risk calculations\
│   └── orbital.ts        # Orbital mechanics utilities\
├── model/                # Python data science models\
│   ├── main.py           # Python entry point\
│   ├── weather\_model.py  # Weather prediction logic\
│   └── requirements.txt  # Python dependencies\
└── public/               # Static assets


## **🚀 Getting Started**

### **Prerequisites**

- Node.js 18+

- pnpm (or npm/yarn)

- Python 3.10+ (for the data model)


### **Installation**

1. **Clone the repository**\
   git clone \[https\://github.com/yourusername/leedshack2026-prototype.git]\(https\://github.com/yourusername/leedshack2026-prototype.git)\
   cd leedshack2026-prototype

2. **Install Frontend Dependencies**\
   pnpm install

3. **Setup Python Environment (Optional for full backend features)**\
   Navigate to the model directory and install requirements.\
   cd model\
   pip install -r requirements.txt\
   cd ..



### **Running the Application**

1. **Start the Development Server**\
   pnpm dev

2. **Access the Dashboard**\
   Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.


## **🤝 Contributing**

Contributions are welcome! Please follow these steps:

1. Fork the project.

2. Create your feature branch (git checkout -b feature/AmazingFeature).

3. Commit your changes (git commit -m 'Add some AmazingFeature').

4. Push to the branch (git push origin feature/AmazingFeature).

5. Open a Pull Request.


## **📄 License**

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

_Built with ❤️ for LeedsHack 2026_
