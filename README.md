<div align="center">
  <h3 align="center">CodePro Dashboard</h3>
  <p align="center">
    A comprehensive analytics dashboard for tracking your LeetCode journey
  </p>
</div>


<!-- ABOUT THE PROJECT -->
## About The Project

CodePro Dashboard is a Privacy First, Open Source analytics platform that helps developers track their coding progress on LeetCode. 

### Demo

### Live Demo
[https://codepro-chi.vercel.app/](https://codepro-chi.vercel.app/)

### Screenshot
![demo_1](https://raw.githubusercontent.com/Windsooon/codepro/refs/heads/main/public/demo_1.png)

![demo_2](https://raw.githubusercontent.com/Windsooon/codepro/refs/heads/main/public/demo_2.png)

### Features

- **Comprehensive Analytics**: Track your progress with detailed statistics including problems solved by difficulty, acceptance rates, and submission trends
- **Interactive Charts**: Visualize your coding journey with beautiful charts powered by Recharts
- **Tag Analysis**: Analyze your performance across different problem categories and identify areas for improvement


### Key Dashboard Sections

- **Overview**: Main dashboard with statistics overview and submission activity trends
- **Practice**: Detailed problem-solving analytics and progress tracking
- **Performance**: In-depth performance metrics and improvement insights
- **Interview**: Interview preparation tracking and readiness metrics
- **Review**: Code review and learning progress management

<!-- DEPLOYMENT -->
## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Windsooon/codepro)

1. Click the deploy button above
2. Clone your repository to Vercel
3. Your dashboard will be live immediately with demo data!


<!-- GETTING STARTED -->
## Run locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js 18 or higher
  ```sh
  node --version
  ```
* npm or pnpm (recommended)
  ```sh
  npm install npm@latest -g
  # or
  npm install -g pnpm
  ```

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Windsooon/codepro.git
   ```

2. Navigate to the project directory
   ```
   cd codepro
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Start the development server
   ```
   npm run dev
   ```

The dashboard will start with demo data. To sync your real LeetCode submissions, follow the authentication setup below.

### Authentication Setup

To sync your personal LeetCode submissions:

1. **Go to https://leetcode.com and log in** to your account

2. **Open Developer Tools** (F12 or right-click → Inspect)

3. **Navigate to Application/Storage tab**
   - Go to **Application** → **Cookies** → **https://leetcode.com**

4. **Copy Required Values**
   - Find `csrftoken` row → copy the **Value** (not the name)
   - Find `LEETCODE_SESSION` row → copy the **Value** (not the name)

5. **Configure in Dashboard**
   - Click "Configure & Sync" button in the dashboard
   - Paste the CSRF token and session values
   - Click "Save Authentication"

6. **Start Syncing**
   - Click "Start Sync" to begin importing your submissions
   - The sync will fetch your submissions in batches of 20
   - Progress will be shown in real-time

### Security Notice

- **Local storage only**: All data is stored in your browser's localStorage
- **Open source**: You can verify the code yourself
- **Auto-cleanup**: Storage is automatically managed when approaching limits



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

### Development Setup

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions

### Areas for Contribution

- 🐛 **Bug Fixes**: Help identify and fix issues
- ✨ **New Features**: Add new analytics and visualizations
- 🎨 **UI/UX**: Improve the design and user experience
- 📖 **Documentation**: Improve documentation and guides
- 🧪 **Testing**: Add unit and integration tests
- 🌐 **Internationalization**: Add support for more languages


## Acknowledgments

- [LeetCode](https://leetcode.com) for providing the platform that makes this dashboard possible
- [Next.js](https://nextjs.org) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com) for the beautiful component library
- [Recharts](https://recharts.org) for the interactive chart components
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework

---