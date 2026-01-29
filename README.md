# ChatApp - AI-Powered Customer Support Chatbot

A Next.js-based AI chatbot platform that enables businesses to create intelligent customer support assistants powered by Google's Gemini AI.

## Technology Stack

### Frontend & Backend
- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19.2.3
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI

### Backend Services
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** Clerk
- **AI Provider:** Google Gemini AI

### Key Libraries
- **Form Management:** React Hook Form with Zod validation
- **State Management:** React Hooks
- **File Processing:** pdf-parse (for PDF files)
- **Token Counting:** js-tiktoken

## AI Model Configuration

### Primary Model
- **Model Name:** `gemini-3-flash-preview`
- **Provider:** Google Gemini AI
- **Temperature:** 0.7 (for conversational responses)
- **Max Output Tokens:** 1,000 tokens per response
- **Context Window:** ~6,000 tokens (~24,000 characters)

### Model Behavior
- The chatbot is configured as an AI assistant, a friendly and helpful customer support specialist
- Responses are kept concise (2-4 sentences maximum)
- Uses knowledge base context to answer questions accurately
- Supports conversation history for context-aware responses

## File Upload Limits

### Supported File Types
- **CSV** (.csv)
- **Text** (.txt)
- **PDF** (.pdf)

### Upload Restrictions
- **Maximum File Size:** 10 MB per file
- **Content Processing:** Files are automatically processed and summarized
- **Summary Limit:** Content is compressed to under **2,000 words** for knowledge base storage
- **Processing:** Removes navigation, menus, buttons, CTAs, pricing tables, ads, and decorative content to keep only factual information

## Sections Feature

Sections allow you to configure different behaviors and tones for specific topics or use cases. Each section can have its own knowledge sources, tone, and scope rules.

### Tone Options

The chatbot supports four different tone settings:

1. **Strict (Fact-Based)**
   - Only answers when fully confident
   - No small talk
   - Best for: Technical documentation, policy information

2. **Neutral**
   - Professional and concise
   - Best for: General business inquiries, standard FAQ

3. **Friendly**
   - Warm and conversational
   - Good for: General FAQ, customer engagement
   - Most commonly used setting

4. **Empathetic**
   - Support-first approach
   - Apologetic and calming
   - Best for: Customer complaints, support issues

### Scope Rules

#### Allowed Topics
- **Purpose:** Restricts the AI to only discuss specific topics
- **Format:** Comma-separated list (e.g., "pricing, returns, shipping")
- **Example:** If set to "pricing, returns", the chatbot will only respond to questions about these topics
- **Use Case:** Create specialized sections for specific departments or topics

#### Blocked Topics
- **Purpose:** Prevents the AI from discussing certain topics
- **Format:** Comma-separated list (e.g., "competitors, refunds")
- **Example:** If set to "competitors", the chatbot will avoid discussing competitor information
- **Use Case:** Protect sensitive information or avoid certain conversation topics

### Section Configuration
- **Name:** Descriptive name for the section (e.g., "Billing Policy")
- **Description:** When the AI should use this section (used by routing logic)
- **Data Sources:** Attach one or more knowledge sources to the section
- **Status:** Active, Draft, or Disabled

## Key Features

### Knowledge Base Management
- Upload files (CSV, TXT, PDF) up to 10 MB
- Add website URLs for content scraping
- Automatic content summarization and processing
- Multiple knowledge sources per section

### Conversation Management
- Full conversation history tracking
- Message storage and retrieval
- Session management
- Visitor tracking

### Widget Embedding
- Generate embeddable chatbot widget code
- Customizable appearance (colors, welcome messages)
- Domain restrictions for security
- JWT-based session authentication

### Team Management
- Add team members
- Role-based access control
- Organization management via Clerk

### Analytics & Overview
- Conversation statistics
- Dashboard overview
- Analytics and reporting

## Getting Started

### Prerequisites
- Node.js 20+ 
- PostgreSQL database
- Clerk account (for authentication)
- Google Gemini API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd chatapp
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with:
```
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
```

4. Set up the database
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
chatapp/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── dashboard/        # Dashboard pages
│   └── embed/            # Embed widget page
├── components/            # React components
│   └── ui/               # UI component library
├── lib/                  # Utility functions
│   ├── gemini.ts         # Gemini AI integration
│   ├── openAI.ts         # OpenAI integration (legacy)
│   └── prisma.ts         # Database client
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## API Endpoints

### Chat
- `POST /api/chat/public` - Public chat endpoint (widget)
- `POST /api/chat/test` - Test chat endpoint

### Knowledge
- `GET /api/knowledge/fetch` - Fetch knowledge sources
- `POST /api/knowledge/store` - Store new knowledge source
- `DELETE /api/knowledge/delete` - Delete knowledge source

### Sections
- `GET /api/section/fetch` - Fetch all sections
- `POST /api/section/create` - Create new section
- `DELETE /api/section/delete` - Delete section

### Conversations
- `GET /api/conversations/fetch` - Fetch conversations
- `GET /api/conversations/[id]/messages` - Get conversation messages
- `POST /api/conversations/[id]/reply` - Reply to conversation

## Database Schema

### Main Models
- **User** - User accounts
- **MetaData** - Business metadata
- **KnowledgeSource** - Uploaded knowledge sources
- **Section** - Chatbot sections with tone and rules
- **ChatBotMetadata** - Chatbot appearance settings
- **Conversation** - Chat conversations
- **Message** - Individual messages
- **Widget** - Widget configurations
- **TeamMember** - Team member management

## Development Commands

```bash
# Development
npm run dev              # Start development server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:push      # Push schema changes

# Build
npm run build            # Build for production
npm start                # Start production server

# Linting
npm run lint             # Run ESLint
```

## Deployment

The easiest way to deploy is using [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Make sure to set all required environment variables in your deployment platform.

## License

[Add your license here]

## Support

For issues and questions, please [create an issue](link-to-issues) or contact support.
