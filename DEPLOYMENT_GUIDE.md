# 🚀 Smart-Ag-AI Deployment Guide for Demo/Presentation

This guide will help you deploy your Smart Agriculture IoT system for demonstration to judges or stakeholders.

## 📋 System Components

Your project consists of:
1. **Backend Server** - Node.js/Express + MQTT Broker + Socket.io
2. **AI Service** - Python/FastAPI (Central Brain 🧠)
3. **Frontend** - Next.js dashboard
4. **Database** - Supabase (already hosted ✅)
5. **ESP32 Device** - Hardware sensor node

---

## 🎯 Deployment Options

### **Option 1: Full Cloud Deployment (Recommended for Remote Demos)**

This option hosts everything in the cloud, so judges can access it from anywhere.

#### **1️⃣ Deploy Backend to Railway (Free Tier)**

Railway is perfect for Node.js apps and supports MQTT.

**Steps:**

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project (run from smart-ag-ai root directory)
   cd C:\Users\ASUS VIVOBOOK\Desktop\year3\smart-ag-ai
   railway init
   
   # Create new project
   railway link
   
   # Add environment variables
   railway variables set SUPABASE_URL="https://waxcpawswvwzljiiitax.supabase.co"
   railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGNwYXdzd3Z3emxqaWlpdGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5Mzc4MDAsImV4cCI6MjA4MzUxMzgwMH0.cIf-4IVBZzSx6uQqeYQO46B-vxkOazEgiPJQRUlU7sM"
   railway variables set SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGNwYXdzd3Z3emxqaWlpdGF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkzNzgwMCwiZXhwIjoyMDgzNTEzODAwfQ.yT_LYwYEHh-jXXil7vSOaKn39_ILGzgFNDX6gEJ0V9E"
   railway variables set DATABASE_URL="postgresql://postgres.waxcpawswvwzljiiitax:dalin241205!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   railway variables set DIRECT_URL="postgresql://postgres.waxcpawswvwzljiiitax:dalin241205!@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
   railway variables set MQTT_PORT=1883
   railway variables set SOCKET_PORT=5000
   railway variables set NODE_ENV=production
   
   # Deploy
   railway up
   ```

3. **Get Your Backend URL**
   - After deployment, Railway will provide a URL like: `https://your-app.railway.app`
   - Note this URL - you'll need it for the frontend

4. **Enable MQTT Port**
   - In Railway dashboard, go to your project
   - Settings → Networking → TCP Proxy
   - Expose port 1883 for MQTT
   - Note the MQTT URL (e.g., `mqtt://your-app.railway.app:1883`)

#### **2️⃣ Deploy AI Service to Railway (Free Tier)**

The AI service handles sensor interpretation and chat.

**Steps:**

1. **Deploy AI Service**
   ```bash
   cd ai-service
   railway init (Select "Empty Project" or link to existing)
   
   # Add environment variables
   railway variables set GEMINI_API_KEY="your-key-here"
   railway variables set DATABASE_URL="your-supabase-db-url"
   railway variables set NODE_BACKEND_URL="backend-production-8d2c.up.railway.app"
   
   # Deploy
   railway up
   ```

2. **Get Your AI Service URL**
   - Note the URL (e.g., `https://your-ai-service.railway.app`)

#### **3️⃣ Update Backend Environment Variables**

Go back to your Backend project in Railway and add:
- `AI_SERVICE_URL="https://your-ai-service.railway.app"`

#### **4️⃣ Deploy Frontend to Vercel (Free)**

Vercel is the best platform for Next.js apps.

**Steps:**

1. **Update Frontend Environment Variables**
   
   First, create a production environment file:
   ```bash
   cd client
   ```
   
   Create `.env.production`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://waxcpawswvwzljiiitax.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGNwYXdzd3Z3emxqaWlpdGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5Mzc4MDAsImV4cCI6MjA4MzUxMzgwMH0.cIf-4IVBZzSx6uQqeYQO46B-vxkOazEgiPJQRUlU7sM
   NEXT_PUBLIC_API_URL=https://backend-production-8d2c.up.railway.app
   NEXT_PUBLIC_SOCKET_URL=https://backend-production-8d2c.up.railway.app
   NEXT_PUBLIC_MQTT_WS_URL=https://backend-production-8d2c.up.railway.app
   ```
   
   ⚠️ **Replace `your-backend.railway.app` with your actual Railway URL!**

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Deploy (from client directory)
   cd C:\Users\ASUS VIVOBOOK\Desktop\year3\smart-ag-ai\client
   vercel --prod
   ```

3. **Add Environment Variables in Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project
   - Settings → Environment Variables
   - Add all the variables from `.env.production`

#### **5️⃣ Final Environment Variable Checklist**

| Component | Variable Name | Value Guide |
|-----------|---------------|-------------|
| **Backend** | `AI_SERVICE_URL` | `https://your-ai-service.railway.app` |
| | `SUPABASE_URL` | From Supabase Settings |
| | `SUPABASE_SERVICE_KEY` | From Supabase Settings |
| | `DATABASE_URL` | From Supabase Settings (Connection String) |
| **AI Service** | `GEMINI_API_KEY` | Your Google AI Key |
| | `NODE_BACKEND_URL` | `https://your-backend.railway.app` |
| | `DATABASE_URL` | Same as Backend |
| **Frontend** | `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` |
| | `NEXT_PUBLIC_MQTT_WS_URL` | `wss://your-backend.railway.app:1883` |
#### **3️⃣ Update ESP32 Configuration**

Update your ESP32 code to point to the hosted backend:

```cpp
// In your smartag_device.ino file
const char* mqtt_server = "your-backend.railway.app";  // Railway MQTT URL
const int mqtt_port = 1883;
```

---

### **Option 2: Local Network Demo (Best for In-Person Presentations)**

If you're presenting to judges in person, this is simpler and more reliable.

#### **1️⃣ Use Your Laptop as the Server**

1. **Start Backend**
   ```bash
   cd C:\Users\ASUS VIVOBOOK\Desktop\year3\smart-ag-ai
   npm start
   ```

2. **Start Frontend**
   ```bash
   cd client
   npm run build
   npm start
   ```

3. **Find Your Local IP Address**
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., `192.168.1.100`)

4. **Update ESP32 to Use Your IP**
   ```cpp
   const char* mqtt_server = "192.168.1.100";  // Your laptop's IP
   ```

5. **Share Access with Judges**
   - Frontend: `http://192.168.1.100:3000`
   - Everyone must be on the same WiFi network

---

### **Option 3: Hybrid Approach (Recommended for Most Cases)**

Host frontend + backend in cloud, but keep ESP32 for live demo.

1. **Deploy Frontend & Backend** (Use Option 1 steps)
2. **Keep ESP32 with you** for live sensor readings
3. **Backup Data**: Pre-populate database with sample data in case of connectivity issues

---

## 🎥 **Presentation Tips**

### **Before the Demo:**

1. **Test Everything**
   - Open the dashboard URL on your phone
   - Verify data is flowing
   - Take screenshots as backup

2. **Prepare Backup Demo**
   - Record video of working system
   - Export PDF reports from dashboard
   - Have screenshots of all features

3. **Create Demo Account**
   - Set up a clean demo user account
   - Pre-populate with meaningful data

### **During the Demo:**

1. **Start with the Dashboard**
   - Show real-time sensor data
   - Demonstrate analytics
   - Export a report

2. **Show the Hardware**
   - Display ESP32 with sensors
   - Trigger relay/pump manually
   - Show MQTT messages in real-time

3. **Explain the Architecture**
   - Use the `system_workflow_flowchart.html`
   - Explain data flow from sensor → cloud → dashboard

---

## 📱 **Quick Access Setup**

Create QR codes for easy judge access:

1. **Generate QR Code for Dashboard**
   - Go to [qr-code-generator.com](https://www.qr-code-generator.com/)
   - Enter your Vercel URL
   - Print or display on screen

2. **Create Demo Credentials Card**
   ```
   Smart-Ag-AI Demo Access
   Dashboard: https://your-app.vercel.app
   Username: demo@smartag.com
   Password: demo123
   ```

---

## 🔧 **Troubleshooting**

### **Backend won't deploy:**
- Check Railway logs: `railway logs`
- Ensure all environment variables are set
- Verify Supabase credentials are correct

### **Frontend shows errors:**
- Check API URL is correct in environment variables
- Verify CORS is enabled on backend
- Open browser console for error messages

### **ESP32 can't connect:**
- Verify MQTT broker is running
- Check firewall isn't blocking port 1883
- Ensure WiFi credentials are correct
- Use `mqtt_server` IP address, not hostname

### **No real-time updates:**
- Check Socket.io connection in browser console
- Verify backend Socket.io port is accessible
- Test MQTT connection with MQTT Explorer tool

---

## ✅ **Pre-Demo Checklist**

- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Database has sample data
- [ ] ESP32 connected and sending data
- [ ] Demo account created
- [ ] QR codes printed
- [ ] Screenshots/video backup ready
- [ ] Presentation slides prepared
- [ ] System architecture diagram ready
- [ ] All team members can access the dashboard

---

## 🌐 **Recommended Deployment Stack (Free Tier)**

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | `https://your-app.vercel.app` |
| Backend | Railway | `https://your-backend.railway.app` |
| Database | Supabase | `https://waxcpawswvwzljiiitax.supabase.co` |
| MQTT | Railway (TCP Proxy) | `mqtt://your-backend.railway.app:1883` |
| Device | Local (ESP32) | WiFi connected |

---

## 📞 **Need Help?**

If something doesn't work:
1. Check the error logs
2. Verify all environment variables
3. Test each component individually
4. Use the backup demo materials

**Good luck with your presentation! 🚀**
