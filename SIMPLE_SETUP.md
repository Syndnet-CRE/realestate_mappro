# ScoutGPT Simple Setup - Claude-Only Backend

**No database. No Docker. Just Claude as your brain.**

This is the simplest possible setup to get ScoutGPT running with Claude AI.

---

## 🎯 What You Get

- ✅ **Chat with Claude** - Real AI responses powered by Claude 3.5 Sonnet
- ✅ **Smart Tools** - Claude can search properties, analyze zoning, calculate metrics
- ✅ **Mock Data** - Datasets and layers appear in UI (no real data needed)
- ✅ **5-Minute Setup** - Get running in minutes, not hours

---

## 📋 Prerequisites

1. **Anthropic API Key** - Get one here: https://console.anthropic.com/settings/keys
   - Free tier includes $5 credit
   - Claude 3.5 Sonnet is ~$3 per million tokens

2. **Python 3.11+** - Check: `python --version`

3. **Node.js** - For frontend (already have this)

---

## 🚀 Quick Start - Local Testing

### Step 1: Get Your Anthropic API Key

1. Go to https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Copy the key (starts with `sk-ant-...`)

### Step 2: Set Your API Key

```bash
# Mac/Linux:
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Windows (Command Prompt):
set ANTHROPIC_API_KEY=sk-ant-your-key-here

# Windows (PowerShell):
$env:ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

### Step 3: Install Python Dependencies

```bash
pip install fastapi uvicorn anthropic python-dotenv
```

Or use the requirements file:
```bash
pip install -r requirements.txt
```

### Step 4: Run the Backend

```bash
python simple_backend.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 5: Test It

Open another terminal:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about real estate in San Francisco"}'
```

You should get a response from Claude!

### Step 6: Run Your Frontend

```bash
npm install
npm start
```

Open http://localhost:3000 and start chatting!

---

## ☁️ Deploy to Railway (Recommended)

Railway is the easiest way to deploy this backend to the cloud.

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This opens your browser - sign in with GitHub.

### Step 3: Deploy

```bash
# From your project root
railway up
```

Railway will:
- Detect Python project
- Install dependencies from requirements.txt
- Start the server
- Give you a public URL

### Step 4: Set Environment Variable

```bash
railway variables set ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Step 5: Get Your URL

```bash
railway domain
```

You'll get a URL like: `https://your-app.railway.app`

### Step 6: Update Netlify

Go to Netlify dashboard → Your site → Site configuration → Environment variables

Add:
```
VITE_API_BASE_URL = https://your-app.railway.app
```

Redeploy your Netlify site (Deploys → Trigger deploy → Clear cache and deploy)

**Done!** Your app now uses Claude for all intelligence.

---

## 🌐 Alternative Deployment Options

### Deploy to Render

1. Go to https://render.com/
2. New → Web Service
3. Connect your GitHub repo
4. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python simple_backend.py`
   - Environment Variable: `ANTHROPIC_API_KEY=sk-ant-...`
5. Deploy!

### Deploy to Heroku

```bash
# Install Heroku CLI
brew install heroku  # Mac
# or download from https://devcenter.heroku.com/articles/heroku-cli

# Login and create app
heroku login
heroku create scoutgpt-backend

# Set environment variable
heroku config:set ANTHROPIC_API_KEY=sk-ant-your-key-here

# Deploy
git push heroku main

# Get your URL
heroku info
```

### Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login and launch
fly auth login
fly launch

# Set environment variable
fly secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here

# Deploy
fly deploy
```

---

## 🛠️ What Claude Can Do

Your backend comes with 4 tools Claude can use:

### 1. Search Properties
```
"Find me commercial properties in San Francisco under $2M"
```
Claude will use the `search_properties` tool.

### 2. Analyze Zoning
```
"What are the restrictions for R-2 zoning at 123 Main St?"
```
Claude will use the `analyze_zoning` tool.

### 3. Calculate Investment Metrics
```
"What's the cap rate on a $500k property with $40k annual rent and $10k expenses?"
```
Claude will use the `calculate_investment_metrics` tool.

### 4. Get Market Trends
```
"Show me market trends in San Francisco"
```
Claude will use the `get_market_trends` tool.

---

## 🔧 Customizing Tools

Edit `simple_backend.py` to add your own tools:

```python
CLAUDE_TOOLS = [
    {
        "name": "your_custom_tool",
        "description": "What your tool does",
        "input_schema": {
            "type": "object",
            "properties": {
                "param": {"type": "string", "description": "Parameter description"}
            },
            "required": ["param"]
        }
    }
]

# Then add the handler in execute_tool():
def execute_tool(tool_name, tool_input):
    if tool_name == "your_custom_tool":
        # Your logic here
        return {"result": "Your result"}
```

---

## 💰 Cost Estimate

**Claude 3.5 Sonnet Pricing:**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Typical usage:**
- Average chat: ~500 tokens input + 500 tokens output = $0.009 (less than 1 cent)
- 1000 chats/day: ~$9/day
- 100 chats/day: ~$0.90/day

**Free tier:** $5 credit = ~500-1000 chats to start

---

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY not configured"

Make sure you set the environment variable:
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
python simple_backend.py
```

### "Port 8000 already in use"

Kill the process or use a different port:
```bash
# Mac/Linux:
lsof -ti:8000 | xargs kill -9

# Or use different port:
PORT=8001 python simple_backend.py
```

### Frontend can't reach backend

Check:
1. Backend is running: `curl http://localhost:8000/health`
2. CORS is enabled (already set in code)
3. Frontend has correct API_BASE_URL in .env

### Claude not responding

Check:
1. API key is valid: https://console.anthropic.com/settings/keys
2. You have remaining credits: https://console.anthropic.com/settings/billing
3. Check backend logs for errors

---

## 🔐 Security Notes

**For Production:**

1. **Don't expose API key in frontend** - Always use a backend proxy (this setup is correct!)

2. **Add rate limiting** - Prevent abuse:
   ```python
   from slowapi import Limiter
   limiter = Limiter(key_func=lambda: "global")

   @app.post("/chat")
   @limiter.limit("10/minute")
   async def chat(message: ChatMessage):
       ...
   ```

3. **Use HTTPS** - Railway/Render/Heroku provide this automatically

4. **Restrict CORS** - Update `allow_origins` to only your Netlify domain:
   ```python
   allow_origins=["https://your-site.netlify.app"]
   ```

---

## 📊 Monitoring

### Check Backend Health

```bash
curl https://your-backend-url.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "scoutgpt-simple-backend",
  "claude_configured": true
}
```

### View Railway Logs

```bash
railway logs
```

### Monitor API Usage

Check your Anthropic dashboard: https://console.anthropic.com/settings/usage

---

## 🎓 Next Steps

### Add Real Data Sources

Replace mock data in `execute_tool()` with real API calls:

```python
def execute_tool(tool_name, tool_input):
    if tool_name == "search_properties":
        # Call Zillow API, Redfin, etc.
        import requests
        response = requests.get("https://api.zillow.com/...", params=tool_input)
        return response.json()
```

### Add Database (Later)

When you need persistent data:
1. Add PostgreSQL (Railway provides this)
2. Store search history, user preferences, etc.
3. But Claude still handles all the intelligence!

### Add Authentication

Protect your backend:
```python
from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.post("/chat")
async def chat(message: ChatMessage, credentials = Security(security)):
    # Verify token
    if credentials.credentials != "your-secret-token":
        raise HTTPException(status_code=401)
    ...
```

---

## ✅ Summary

You now have:
- ✅ Simple 1-file Python backend
- ✅ Claude AI integration with custom tools
- ✅ Ready to deploy to Railway/Render/Heroku
- ✅ Frontend already configured to use it
- ✅ No database or complex setup needed

**Questions?** Check the code comments in `simple_backend.py` - everything is explained!

---

**Built with ❤️ using Claude 3.5 Sonnet**
