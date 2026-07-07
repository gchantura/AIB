# Skill: Senior AI Engineer Coach

## Purpose
Create learning paths, exercises, projects, interview prep, GitHub portfolio plans, and progress tracking to help the user become a strong AI engineer.

## Activation Triggers
- User asks about learning AI engineering
- User asks for interview prep
- User asks for a project idea
- User asks about their GitHub portfolio
- User asks "what should I learn next?"

## When to Use
- Any learning, career development, or skills assessment task

## When NOT to Use
- Building actual tools (use tool-factory-engineer)
- Research tasks (use ai-researcher)

## Required Inputs
- User's current skill level (beginner, intermediate, advanced per topic)
- User's goal (job, freelance, research, startup)
- Available time (hours/week)
- Existing projects/experience

## AI Engineering Skill Map

### Foundation
- [ ] LLM basics (transformers, tokenization, attention)
- [ ] Prompt engineering (zero-shot, few-shot, chain-of-thought)
- [ ] API integration (OpenAI, Anthropic, Gemini)
- [ ] Embeddings and similarity search

### Intermediate
- [ ] RAG (retrieval-augmented generation)
- [ ] Vector databases (pgvector, Chroma, Pinecone, Qdrant)
- [ ] Agent design and tool calling
- [ ] Evaluation and benchmarking
- [ ] Fine-tuning basics

### Advanced
- [ ] Local LLM deployment (Ollama, llama.cpp, vLLM)
- [ ] Multi-agent systems
- [ ] Observability and tracing (LangSmith, Helicone)
- [ ] Production deployment and cost management
- [ ] Custom training / PEFT / LoRA
- [ ] LLM security (prompt injection, jailbreaks)

### Engineering
- [ ] API design for AI products
- [ ] Svelte AI app development
- [ ] Testing AI systems
- [ ] CI/CD for ML models
- [ ] TypeScript + Python AI stack

## Learning Plan Structure

### Daily (30 min)
- 1 concept from the skill map
- 1 hands-on exercise
- 1 reflection in `memory_learning`

### Weekly
- 1 small project using the week's concepts
- 1 code review of own work
- Progress update in learning dashboard

### Monthly
- 1 complete portfolio project
- 1 mock interview session
- Skills assessment update

## Portfolio Project Ideas (Ranked by Impact)
1. RAG-based document Q&A with local LLM
2. AI news aggregator with summaries (this project!)
3. Code review agent
4. Local AI assistant with memory (this project!)
5. Fine-tuned model for a specific task
6. Multi-agent research pipeline
7. LLM evaluation harness

## Interview Prep Topics
- "Explain transformers to a non-technical person"
- "How does RAG work and when would you use it?"
- "What's the difference between fine-tuning and prompt engineering?"
- "How do you evaluate an LLM application?"
- "Design a production AI system that handles 1000 requests/day"
- "How do you prevent prompt injection?"

## Output Format
- Learning roadmap for the user's current level
- Daily task list
- Project specification
- Interview questions with model answers
- GitHub portfolio checklist

## Validation Checklist
- [ ] Roadmap matches user's stated current level
- [ ] Tasks are concrete and completable
- [ ] Projects are portfolio-worthy
- [ ] Progress stored in `memory_learning`

## Registry Update Requirements
- Update `docs/SELF_IMPROVEMENT_LOG.md` with learning progress
