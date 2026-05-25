# smart_circulate
Overview
SmartCircular automates the processing of institutional documents (PDFs, images) by:

Extracting key information (departments, deadlines, action items, recipients)
Using Google Gemini AI to generate structured, machine-readable summaries
Automatically identifying and emailing relevant stakeholders
Providing a web interface for staff to manage and track documents
Key Stats
Model: Google Gemini 2.5-flash (multimodal LLM)
Backend: Node.js/Express + MongoDB
Frontend: React
Infrastructure: Docker + Kubernetes
🎯 Problem & Solution
Problem
Large institutions (universities, corporations) receive hundreds of circulars, memos, and announcements. Manually:

Reading and summarizing each document
Finding the right recipients
Sending targeted emails
Tracking who was notified
...is time-consuming and error-prone.

Our Solution
SmartCircular solves this by:

Automated Extraction — OCR + Gemini pull departments, dates, action items, location, and roles from documents
Structured Output — Returns a 13-field JSON schema (summary, tags, confidence scores, explainability)
Smart Routing — Generates a "recipient query" to auto-select relevant staff
Email Automation — Sends curated notifications to the right people instantly
Real-time Updates — WebSocket support for live status updates
🏗️ Architecture & Tech Stack
Backend
Framework: Express.js (Node.js)
Database: MongoDB (Atlas)
AI/ML: Google Generative AI SDK (Gemini 2.5-flash)
OCR: Tesseract.js + pdf-parse
Authentication: JWT + bcryptjs
File Upload: Multer
Email: Nodemailer
WebSockets: Socket.io
Task Queue: Bull (Redis)
Frontend
Framework: React
Styling: Tailwind CSS
Build: Standard React build pipeline
Pipeline
Upload → Text Extraction (pdf-parse/OCR) 
  → Gemini Analysis 
  → JSON Normalization 
  → Database Save 
  → Recipient Selection 
  → Email Send 
  → WebSocket Notification
Output Schema (13 Fields)
{
  "summary": "Brief summary",
  "summary_text": "Detailed summary",
  "tags": ["tag1", "tag2"],
  "extracted_fields": {
    "departments": ["CSE", "ECE"],
    "roles": ["faculty", "HOD"],
    "dates": ["2025-12-15"],
    "deadlines": ["2025-12-20"],
    "action_items": ["Submit forms", "Attend meeting"],
    "location": "Room 101",
    "keywords": ["budget", "submission"]
  },
  "confidence_scores": { "summary": 0.85, ... },
  "recipient_query": "department=CSE AND role=faculty",
  "recipient_query_text": "All CSE faculty",
  "recipient_query_object": { "department": "CSE", "role": "faculty" },
  "explainability": ["Why each field was extracted"],
  "gemini_processed": true
}
✨ Features
Current
✅ PDF/Image upload and processing
✅ Automated text extraction (OCR + text parsing)
✅ AI-powered document analysis using Google Gemini
✅ Structured 13-field JSON output
✅ Automatic recipient identification and email sending
✅ JWT-based authentication for admins
✅ MongoDB storage and retrieval
✅ WebSocket real-time notifications
✅ Admin dashboard for document management
✅ Confidence scores for quality assurance
Planned
🔜 Batch document upload
🔜 Custom recipient rules (admin-defined routing)
🔜 Document type classification (e.g., "Budget Circular", "Meeting Notice")
🔜 Multi-language support
🔜 Calendar integration (auto-add deadlines)
🔜 User feedback loop (thumbs up/down on notifications)
🔜 Analytics dashboard (processing stats, recipient engagement)
🔜 Local LLM option for privacy-sensitive deployments
🔜 Manual review step before auto-email
🔜 Audit logs for compliance
🚀 Setup & Installation
Prerequisites
Node.js >= 14.x
Python >= 3.8 (for OCR helper scripts)
MongoDB Atlas account (or local MongoDB)
Google Generative AI API Key (free tier available at ai.google.dev)
Docker (for containerized deployment)
Local Development
1. Clone the Repository
git clone https://github.com/deepspace1/smart_circulate_.git
cd smartcircular
2. Backend Setup
cd backend
npm install
3. Environment Variables
Create backend/.env:

MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smartcircular
GEMINI_API_KEY=<your-google-generative-ai-key>
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@smartcircular.com
4. Start Backend
npm run dev
5. Frontend Setup
cd ../frontend
npm install
npm start
The app will run at http://localhost:3000 (frontend) and http://localhost:5000 (backend).

📖 Usage
Upload & Analyze a Document
Login with admin credentials
Click "Upload Document" → Select PDF or image
System automatically:
Extracts text (OCR or pdf-parse)
Sends to Gemini for analysis
Generates recipient query
Identifies recipients
Sends targeted emails
Monitor via dashboard or WebSocket updates
API Endpoints
Authentication
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@institution.edu",
  "password": "your-password"
}

# Response
{ "token": "eyJhbGciOiJIUzI1NiIs..." }
Upload & Analyze
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form data: file (PDF or image)

# Response
{
  "document_id": "6c51...",
  "status": "analyzing",
  "analysis": { ...13-field JSON... }
}
Get Analysis Results
GET /api/documents/:document_id
Authorization: Bearer <token>

# Response
{
  "document_id": "6c51...",
  "analysis": { ...13-field JSON... },
  "recipients_notified": ["faculty1@...", "faculty2@..."],
  "emails_sent": 5
}
Python Helper Script
export GOOGLE_API_KEY="your-key-here"
python3 backend/scripts/analyze_and_submit.py \
  --file ./cse_circular.jpg \
  --server http://localhost:5000 \
  --doc 6c51... \
  --token <jwt-token>
🔒 Data Protection & Security
Authentication & Authorization
Passwords: Hashed with bcryptjs (never stored in plain text)
Tokens: JWT with 7-day expiry; Bearer token required for API calls
Admin-only routes: Protected via auth middleware
Data Privacy
API Caching: Disabled for all /api routes (no browser cache of sensitive data)
Uploaded Files: Stored in backend/uploads/ with unique hash names
Environment Secrets: API keys stored in .env (not in code)
CORS: Restricted in production to trusted frontend origins
Bias Mitigation
Reliance on Gemini: Model bias is inherited from Google's training
Confidence Scores: Each extracted field includes a confidence score (0–1); low scores flag manual review
Explainability Array: Stores reasoning for each extraction decision
Manual Review Option: Admins can review and edit extracted data before sending emails
Audit Logs: Track all document processing and email sends (planned)
Recommendations
🔐 Rotate JWT_SECRET periodically
🔐 Use HTTPS in production
🔐 Implement rate limiting on upload endpoints
🔐 Set data retention policies (auto-delete old uploads)
🔐 Enable MongoDB IP whitelist and VPC access
🔐 Restrict Gemini API key to specific project/IP ranges
📊 Evaluation Metrics
Currently Tracked
Confidence Scores: Per-field confidence (0–1); defaults: summary=0.85, departments=0.8, etc.
Fallback Responses: Count of failed analyses that returned safe defaults
Test Coverage: Unit tests for aiService, ocrService; integration tests for uploadFlow
Recommended Metrics to Add
Metric	Why	How to Measure
Extraction Accuracy	How often are dates, departments correct?	Compare against manually-labeled ground truth
Recipient Precision	How many auto-selected recipients were correct?	Survey: "Did you need this email?"
OCR Accuracy	How much text is correctly extracted?	Compare OCR output vs. scanned document
Email Delivery Rate	What % of emails reach inboxes?	Track SMTP bounce/delivery logs
False Positive Rate	How often do wrong departments get notified?	Log misrouting incidents
Response Time	How fast from upload to email sent?	Track timestamp deltas
User Satisfaction	Do recipients find notifications useful?	Post-email survey (thumbs up/down)
Test Suite
npm test
🛠️ Improvements & Future Features
High Priority
Manual Review Step — Admins approve extracted data before auto-emailing
Audit Logs — Track all uploads, analyses, emails, and recipients for compliance
Rate Limiting — Prevent abuse of upload/analysis endpoints
Better Error Handling — Log failures, retry logic, graceful degradation
Data Retention Policy — Auto-delete old uploads (configurable TTL)
Medium Priority
Batch Upload — Process 10+ documents in one request
Custom Recipient Rules — Admin-defined routing rules (e.g., "always notify Finance for budget docs")
Document Templates — Recognize memo types and auto-populate recipient lists
Local LLM Option — Use Ollama or LLaMA for air-gapped environments
Analytics Dashboard — Charts on document volume, departments notified, response rates
Lower Priority
Multi-Language Support — Analyze and send emails in Spanish, Mandarin, etc.
Calendar Integration — Auto-add extracted deadlines to Google Calendar / Outlook
Slack/Teams Integration — Send summaries to Slack channels
Email Categorization — Separate "urgent" from "FYI" notifications
Feedback Loop — Track if recipients opened/actioned the email
🐳 Deployment
Docker
# Build backend image
docker build -t smartcircular-backend ./backend

# Build frontend image
docker build -t smartcircular-frontend ./frontend

# Run with docker-compose
docker-compose up
Kubernetes
# Deploy to cluster
kubectl apply -f infrastructure/k8s/

# Check status
kubectl get pods
kubectl logs deployment/smartcircular-backend
Environment Setup
Set all secrets in backend/.env or via Kubernetes ConfigMaps
Ensure MongoDB Atlas IP whitelist includes pod IPs
Configure CORS origins to match frontend domain
Scaling
Horizontal: Add more backend replicas in k8s deployment
Vertical: Increase container CPU/memory limits
Bottleneck: Gemini API rate limits; consider caching or batch analysis
🧪 Testing
Run Tests
cd backend
npm test
Test Files
backend/tests/unit/aiService.test.js — Gemini analysis logic
backend/tests/unit/ocrService.test.js — Text extraction
backend/tests/integration/uploadFlow.test.js — End-to-end upload → email
Adding Tests
Use jest framework
Mock Gemini API calls to avoid quota usage
Test both happy path and error cases
📁 Project Structure
smartcircular/
├── backend/
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   └── validation.js     # Input validation
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── services/
│   │   ├── geminiService.js  # Gemini API wrapper
│   │   ├── ocrService.js     # Text extraction (pdf-parse + tesseract)
│   │   ├── emailService.js   # Nodemailer integration
│   │   └── recipientService.js # Recipient selection logic
│   ├── scripts/              # Helper scripts (Python, Node)
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── uploads/              # Temporary file storage
│   ├── server.js             # Express app
│   ├── package.json
│   └── .env                  # Local secrets
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── infrastructure/
│   └── k8s/                  # Kubernetes manifests
├── README.md                 # This file
└── docker-compose.yml
🤝 Contributing
Fork the repository
Create a feature branch (git checkout -b feature/my-feature)
Commit changes with clear messages
Push to your fork
Open a Pull Request with description
Code Standards
Use ESLint for JavaScript (run npm run lint)
Add tests for new features
Update README for API changes
Document environment variables
📝 License
MIT License — See LICENSE file for details.
🙏 Acknowledgments
Google Generative AI for Gemini multimodal capabilities
Tesseract.js for OCR
MongoDB for scalable data storage
Express.js community for excellent documentation
