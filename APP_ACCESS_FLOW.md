# Application Access & Navigation Flow

This diagram describes the step-by-step path a user takes to access the Smart Ag AI platform and reach its core features.

```mermaid
graph TD
    %% Entry Point
    Start((Farmer visits URL)) --> Login{Already has account?}
    
    %% Auth Path
    Login -->|No| Register[Sign Up with Email/Phone]
    Login -->|Yes| SignIn[Sign In with Credentials]
    Register --> SignIn
    
    %% Security Layer
    SignIn --> AuthGate[Supabase Auth Verification]
    AuthGate -->|Success| LangSelect{Choose Language}
    
    %% Language Preference
    LangSelect -->|Khmer| DashKH[Dashboard - ភាសាខ្មែរ]
    LangSelect -->|English| DashEN[Dashboard - English]
    
    %% Feature Navigation
    DashKH --> Features{User Goal?}
    DashEN --> Features
    
    %% Goal Paths
    Features -->|Check Soil| SensorGrid[View Live NPK & Moisture]
    Features -->|Need Advice| AIChat[Talk to AI Agronomist]
    Features -->|Control Pumps| RelayPanel[Manual/Auto Pump Control]
    Features -->|Check Weather| WeatherPanel[View 3-Day Forecast]
    Features -->|View History| Logs[Check Irrigation & Expense Logs]
    
    %% Feedback Loop
    SensorGrid --> DashKH
    AIChat --> DashKH
    RelayPanel --> DashKH
    
    %% Styling
    style Start fill:#10b981,stroke:#fff,color:#fff
    style AuthGate fill:#3b82f6,stroke:#fff,color:#fff
    style DashKH fill:#8b5cf6,stroke:#fff,color:#fff
    style DashEN fill:#8b5cf6,stroke:#fff,color:#fff
    style AIChat fill:#f59e0b,stroke:#fff,color:#fff
```

### Why this is important for your report:
By showing this flow, you prove to your professors that you have designed a **complete User Experience (UX)**. It shows that you didn't just build a single page, but a structured application with a logical path from registration to advanced AI control.
