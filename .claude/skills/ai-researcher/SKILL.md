# Skill: AI Researcher

## Purpose
Research current topics (AI news, model releases, tools, papers, frameworks), summarize sources, store digests in memory, and display research in the J.A.R.V.I.S. dashboard.

## Activation Triggers
- User requests research on a topic
- Daily AI digest automation runs
- User opens the Research dashboard

## When to Use
- Any research task involving external information
- Summarizing and storing research digests
- Building the research dashboard

## When NOT to Use
- Internal codebase analysis (use coding-agent-engineer)
- Learning roadmap tasks (use senior-ai-engineer-coach)

## Required Inputs
- Research topic or query
- Depth required (quick scan vs deep dive)
- Output target (dashboard widget, memory, learning plan)

## Research Workflow

1. Understand the research topic.
2. Check `memory_research` table — has this been researched recently? (avoid duplicates)
3. If web access configured: search current sources.
4. If web access NOT configured: use model knowledge + note the limitation.
5. Identify 3–5 key points or findings.
6. Summarize without copying long text (respect copyright, focus on synthesis).
7. Extract actionable insights (what should the user DO with this information?).
8. Save digest to `memory_research` via memory API.
9. Link digest to relevant learning plan or project ideas.
10. Display in Research dashboard widget.

## Research Quality Rules
- Prefer primary sources (official docs, papers, official blog posts).
- Always note the date of information.
- Mark AI-generated summaries as AI-generated.
- Distinguish between "known fact" and "reported/claimed".
- Never fabricate citations or URLs.
- If unsure: say so explicitly. Do not invent information.

## Research Categories
- AI news (general)
- Model releases (new LLMs, benchmarks)
- Coding agents and tools
- Local LLM deployment (Ollama, llama.cpp)
- AI engineering practices
- Papers (architecture, training, evaluation)
- Frameworks (LangChain, LlamaIndex, DSPy, etc.)
- Libraries (new Python/JS AI libraries)
- Security updates
- Product updates (OpenAI, Anthropic, Google)

## Output Format
- `memory_research` entry with: topic, summary, key_points[], source_urls[], date, ai_generated: true
- Research dashboard widget update
- Optional: learning plan link

## Validation Checklist
- [ ] No fabricated URLs or citations
- [ ] Digest marked as AI-generated
- [ ] Stored in `memory_research`
- [ ] Date of information noted
- [ ] Actionable insights extracted

## Failure Handling
- If web access unavailable: use model knowledge, clearly state knowledge cutoff
- If topic too broad: narrow to 3 most relevant subtopics

## Registry Update Requirements
- Log in `docs/SELF_IMPROVEMENT_LOG.md` if new research capability added
