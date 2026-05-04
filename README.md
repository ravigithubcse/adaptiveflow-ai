# AdaptiveFlow AI

## Real-Time Cognitive Process Intelligence Engine

AdaptiveFlow AI is a next-generation, AI-powered real-time business operations intelligence platform that autonomously discovers, monitors, predicts, and heals business processes using advanced artificial intelligence. Unlike traditional AIOps tools that only monitor IT infrastructure, AdaptiveFlow AI is the world's first general-purpose **Cognitive Process Intelligence Engine** that can understand, analyze, and optimize ANY business process in real-time.

### 🚀 What Makes This Unique

**This project does NOT exist in the market today.** Most platforms are either:
- IT-only AIOps (Datadog, Dynatrace) - can't handle business processes
- Static BI dashboards (Tableau, PowerBI) - no real-time AI execution
- Generic chatbots - no deep business context
- RPA tools - only automate what you tell them

**AdaptiveFlow AI combines all of these capabilities in ONE platform:**
1. **Autonomous Process Discovery** - AI learns your business processes by observing data patterns (no manual BPMN modeling)
2. **Cognitive Anomaly Detection** - Detects anomalies not just in metrics, but in process flows and cross-process correlations
3. **Predictive Process Intelligence** - Predicts process failures and bottlenecks BEFORE they happen
4. **Natural Language AI Copilot** - Talk to your live business data using conversational AI
5. **Autonomous Process Healing** - AI can trigger corrective actions with human-in-the-loop approval
6. **Cross-Process Intelligence** - Detects correlations across different business processes
7. **Explainable AI** - Every AI decision shows detailed reasoning

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular 17 Frontend                        │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │   Dashboard  │ │  Anomalies  │ │    AI Copilot       │  │
│  │   (Real-time)│ │  (Explain)  │ │   (Natural Lang)    │  │
│  └──────────────┘ └─────────────┘ └─────────────────────┘  │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │  Predictions │ │   Actions   │ │ Process Health      │  │
│  │  (Forecast)  │ │ (Approval)  │ │   Monitor           │  │
│  └──────────────┘ └─────────────┘ └─────────────────────┘  │
└──────────────────────┬────────────────────────────────────────┘
                     │ WebSocket STOMP + REST API
┌──────────────────────▼────────────────────────────────────────┐
│              Spring Boot 3.2 Backend                          │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │   Event      │ │   Anomaly   │ │  Predictive Engine  │  │
│  │   Ingestion  │ │  Detection  │ │   (AI-Powered)      │  │
│  └──────────────┘ └─────────────┘ └─────────────────────┘  │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │   AI Copilot │ │ Autonomous  │ │   Cross-Process     │  │
│  │   Service    │ │   Action    │ │   Correlation       │  │
│  │ (OpenAI/LLM) │ │   Engine    │ │   Engine            │  │
│  └──────────────┘ └─────────────┘ └─────────────────────┘  │
└──────────────────────┬────────────────────────────────────────┘
                     │ JPA / Hibernate
┌──────────────────────▼────────────────────────────────────────┐
│              SQL Server / H2 Database                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Events  │ │ Anomalies│ │Predictions│ │    Actions     │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, TypeScript, RxJS, WebSocket STOMP |
| Backend | Spring Boot 3.2, Spring WebFlux, Spring Data JPA |
| AI Engine | OpenAI GPT-4o-mini integration with local fallback |
| Real-time | WebSocket STOMP, Server-Sent Events |
| Database | SQL Server (production) / H2 (development) |
| Build | Maven, Node.js |

### 📋 Features

#### 1. Real-Time Event Ingestion
- Simulated business events across 6 process types
- WebSocket streaming to frontend
- Automatic pattern learning

#### 2. AI-Powered Anomaly Detection
- Statistical z-score analysis + AI reasoning
- Cross-process correlation detection
- Explainable AI explanations for every anomaly
- Severity classification (CRITICAL/HIGH/MEDIUM)

#### 3. Predictive Intelligence
- Trend-based forecasting
- 30-minute ahead predictions
- Confidence scoring
- Risk level assessment

#### 4. AI Copilot (Natural Language)
- Chat with your business data
- Context-aware process filtering
- AI-generated insights and recommendations
- Session-based conversation history

#### 5. Autonomous Action Engine
- AI-generated corrective actions
- Human-in-the-loop approval workflow
- Auto-execution for CRITICAL severity
- Impact tracking

### 🚀 Getting Started

#### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+
- SQL Server (optional, H2 included for demo)
- OpenAI API key (optional, local AI fallback included)

#### Backend Setup
```bash
cd adaptiveflow-ai
mvn clean install
mvn spring-boot:run
```

#### Frontend Setup
```bash
cd frontend
npm install
ng serve
```

#### Access the Application
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080/api
- H2 Console: http://localhost:8080/h2-console

### 🔑 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/summary` | GET | Dashboard KPIs |
| `/api/anomalies` | GET | Active anomalies |
| `/api/predictions` | GET | Active predictions |
| `/api/actions/pending` | GET | Pending actions |
| `/api/actions/{id}/approve` | POST | Approve/reject action |
| `/api/copilot/chat` | POST | AI copilot conversation |
| `/ws` | WebSocket | Real-time updates |

### 🧠 AI Integration

The platform integrates with OpenAI's GPT-4o-mini for:
- Natural language query understanding
- Anomaly explanation generation
- Predictive reasoning
- Action recommendation

**Local Fallback**: If no API key is configured, the system uses an intelligent local fallback engine that generates contextually appropriate responses based on process metrics and statistical analysis.

### 📊 Demo Data

The system automatically generates realistic business events for:
- **SALES_ORDER** - Order creation and fulfillment
- **INVENTORY_UPDATE** - Stock movements
- **INVOICE_PROCESSING** - Billing and payments
- **HR_APPROVAL** - Leave and expense requests
- **CUSTOMER_SUPPORT** - Ticket management
- **FINANCIAL_TRANSACTION** - Money transfers

### 🔒 Production Configuration

For production deployment with SQL Server:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=AdaptiveFlowDB;encrypt=true;trustServerCertificate=true
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect
```

### 📈 Future Roadmap

- [ ] Machine Learning model training pipeline
- [ ] Custom process type configuration
- [ ] Multi-tenant SaaS architecture
- [ ] Advanced correlation graph visualization
- [ ] Mobile application
- [ ] Integration with SAP, Salesforce, Workday APIs
- [ ] Real-time alert notifications (Slack, Teams, Email)

### 📄 License

MIT License - See LICENSE file for details.

---

**Created with ❤️ for the future of AI-powered business operations.**
