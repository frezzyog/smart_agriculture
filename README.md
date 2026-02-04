# 🌾 Smart Ag AI

**Smart Ag AI** is a state-of-the-art Smart Agriculture 4.0 Ecosystem designed to empower farmers with real-time AI-driven insights and automated control systems. By bridging the gap between traditional farming and modern IoT technology, Smart Ag AI ensures smarter, more sustainable, and highly efficient agricultural management.

---

## 🚀 Key Features

-   **📊 Real-time Monitoring**: Track critical environmental data including soil moisture, temperature, humidity, and light levels in real-time.
-   **🤖 AI-Powered Insights**: Leverage predictive analytics and smart recommendations to optimize crop growth and resource usage.
-   **🚰 Automated Control**: Remotely manage irrigation systems, pumps, and other IoT devices directly from your dashboard.
-   **📱 Responsive Dashboard**: A sleek, modern interface built for both desktop and mobile monitoring.
-   **🔐 Secure Authentication**: Robust user management and role-based access control powered by Supabase.
-   **⚡ Real-time Data Streaming**: Sub-second updates via MQTT and WebSockets for near-instant control and feedback.

---

## 🛠️ Tech Stack

### Frontend
-   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS 4.0+](https://tailwindcss.com/)
-   **Charts**: [Recharts](https://recharts.org/) for data visualization
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **State Management**: [TanStack Query](https://tanstack.com/query/latest)

### Backend & Infrastructure
-   **Database**: PostgreSQL via [Supabase](https://supabase.com/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **IoT Broker**: [Aedes](https://github.com/moscajs/aedes) (MQTT Broker)
-   **Real-time**: [Socket.io](https://socket.io/) for live dashboard updates
-   **Server**: Node.js & Express

---

## 📂 Project Structure

```text
smart-ag-ai/
├── client/              # Next.js frontend application
│   ├── app/            # App router pages & layouts
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utility functions & configs
├── prisma/             # Database schema & migrations
├── .env                # Environment variables (Root)
├── prisma.config.ts    # Prisma configuration
└── package.json        # Root dependencies (Backend/Broker)
```

---

## 🚦 Getting Started

### Prerequisites
-   Node.js (v18 or higher)
-   npm or yarn
-   A Supabase project (for database & auth)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/smart-ag-ai.git
    cd smart-ag-ai
    ```

2.  **Setup Backend Dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Frontend Dependencies**:
    ```bash
    cd client
    npm install
    ```

4.  **Environment Configuration**:
    Create a `.env` file in the root and `client/.env.local` with your database and Supabase credentials:
    ```env
    # Root .env
    DATABASE_URL="your-postgresql-url"
    
    # client/.env.local
    NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-key"
    ```

5.  **Database Migration**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

6.  **Run the application**:
    -   Start Frontend: `cd client && npm run dev`
    -   Start Backend/Broker: `npm run start` (Configure scripts in package.json)

---

## 🎨 UI Preview

### Dashboard
*Real-time sensor monitoring with interactive control cards.*

### Analytics
*Historical data visualization for informed decision making.*

---

## 🗺️ Roadmap
-   [ ] AI Predictive models for pest detection.
-   [ ] Integration with satellite weather data.
-   [ ] Multi-farm management support.
-   [ ] Mobile App (React Native).

---

---
+
+## ⚠️ បញ្ហា និងកម្រិតកំណត់ (Known Issues)
+ព័ត៌មានលម្អិតអំពីកម្រិតកំណត់បច្ចេកទេស និងបញ្ហាដែលបានដឹង៖ [KNOWN_ISSUES_KH.md](file:///c:/Users/ASUS%20VIVOBOOK/Desktop/year3/smart-ag-ai/KNOWN_ISSUES_KH.md)
+
+---
+
 ## ⚖️ License
 distributed under the ISC License. See `LICENSE` for more information.

---

## 📚 Technical Documentation
- **[API Documentation](API_DOCUMENTATION.md)**: Explore the REST API endpoints and data formats.
- **[Prototype Specifications (Khmer)](PROTOTYPE_SPEC_KH.md)**: Detailed feature list and user flows.
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)**: Step-by-step instructions to deploy the system.

---

**Developed with ❤️ for the future of Farming.**
