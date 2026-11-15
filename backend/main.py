import os
import shutil
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Header, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import engine, get_db, Base
from models import (
    User, Workspace, WorkspaceMember, BrandGuideline, BrandFact,
    Terminology, BrandToneVoice, ApprovedMessaging, ContentSubmission,
    ComplianceFinding, CorrectionSuggestion, ReviewComment, RevisionHistory, ApprovalRecord
)
from services.pdf_service import PDFService
from services.ai_service import AIService
from services.seed_data import init_db_and_seed

app = FastAPI(
    title="BrandCue AI API",
    description="Intelligent Brand Governance & Compliance Backend",
    version="1.0.0"
)

# Enable CORS for frontend development and local servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Run seed data on startup
@app.on_event("startup")
def on_startup():
    init_db_and_seed()

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------
class GuidelineCreate(BaseModel):
    category: str
    title: str
    content: str
    source_title: Optional[str] = None
    tags: Optional[str] = None

class FactCreate(BaseModel):
    category: str
    claim: str
    approved_wording: str
    verification_source: str

class TerminologyCreate(BaseModel):
    term: str
    term_type: str
    replacement_suggestion: Optional[str] = None
    rationale: Optional[str] = None

class ToneCreate(BaseModel):
    dimension_name: str
    guidelines: str
    positive_examples: Optional[str] = None
    negative_examples: Optional[str] = None

class MessagingCreate(BaseModel):
    message_type: str
    title: str
    approved_copy: str
    audience: Optional[str] = None
    context: Optional[str] = None

class ContentSubmitRequest(BaseModel):
    title: str
    category: str
    target_audience: Optional[str] = "Enterprise Customers"
    content: str
    file_name: Optional[str] = None

class ContentUpdateRequest(BaseModel):
    content: str
    changes_summary: Optional[str] = "Manual content revision by author"

class ReviewDecisionRequest(BaseModel):
    decision: str  # approved, changes_requested, rejected
    notes: Optional[str] = ""

class ReviewCommentRequest(BaseModel):
    comment_text: str

class WorkspaceCreateRequest(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

# -------------------------------------------------------------
# AUTH & ROLE SWITCHING (Simulated Enterprise Session)
# -------------------------------------------------------------
@app.get("/api/auth/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.get("/api/auth/current")
def get_current_user(x_user_role: Optional[str] = Header(None), db: Session = Depends(get_db)):
    role = (x_user_role or "admin").lower()
    user = db.query(User).filter(User.role == role).first()
    if not user:
        user = db.query(User).first()
    return user

# -------------------------------------------------------------
# WORKSPACES
# -------------------------------------------------------------
@app.get("/api/workspaces")
def list_workspaces(db: Session = Depends(get_db)):
    return db.query(Workspace).all()

@app.post("/api/workspaces")
def create_workspace(req: WorkspaceCreateRequest, db: Session = Depends(get_db)):
    existing = db.query(Workspace).filter(Workspace.slug == req.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Workspace slug already exists.")
    ws = Workspace(name=req.name, slug=req.slug, description=req.description)
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return ws

# -------------------------------------------------------------
# BRAND KNOWLEDGE BASE MODULE
# -------------------------------------------------------------
@app.get("/api/knowledge/overview")
def get_knowledge_overview(db: Session = Depends(get_db)):
    return {
        "guidelines_count": db.query(BrandGuideline).count(),
        "facts_count": db.query(BrandFact).count(),
        "terminologies_count": db.query(Terminology).count(),
        "prohibited_count": db.query(Terminology).filter(Terminology.term_type == "prohibited").count(),
        "preferred_count": db.query(Terminology).filter(Terminology.term_type == "preferred").count(),
        "tones_count": db.query(BrandToneVoice).count(),
        "messaging_count": db.query(ApprovedMessaging).count()
    }

# Guidelines
@app.get("/api/knowledge/guidelines")
def get_guidelines(category: Optional[str] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(BrandGuideline)
    if category and category != "All":
        q = q.filter(BrandGuideline.category == category)
    if search:
        s = f"%{search}%"
        q = q.filter((BrandGuideline.title.ilike(s)) | (BrandGuideline.content.ilike(s)) | (BrandGuideline.tags.ilike(s)))
    return q.order_by(desc(BrandGuideline.updated_at)).all()

@app.post("/api/knowledge/guidelines")
def create_guideline(item: GuidelineCreate, db: Session = Depends(get_db)):
    obj = BrandGuideline(**item.dict(), workspace_id=1)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@app.delete("/api/knowledge/guidelines/{id}")
def delete_guideline(id: int, db: Session = Depends(get_db)):
    obj = db.query(BrandGuideline).filter(BrandGuideline.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(obj)
    db.commit()
    return {"message": "Deleted"}

# Facts
@app.get("/api/knowledge/facts")
def get_facts(category: Optional[str] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(BrandFact)
    if category and category != "All":
        q = q.filter(BrandFact.category == category)
    if search:
        s = f"%{search}%"
        q = q.filter((BrandFact.claim.ilike(s)) | (BrandFact.approved_wording.ilike(s)))
    return q.order_by(desc(BrandFact.updated_at)).all()

@app.post("/api/knowledge/facts")
def create_fact(item: FactCreate, db: Session = Depends(get_db)):
    obj = BrandFact(**item.dict(), workspace_id=1)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@app.delete("/api/knowledge/facts/{id}")
def delete_fact(id: int, db: Session = Depends(get_db)):
    obj = db.query(BrandFact).filter(BrandFact.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(obj)
    db.commit()
    return {"message": "Deleted"}

# Terminology
@app.get("/api/knowledge/terminology")
def get_terminology(term_type: Optional[str] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Terminology)
    if term_type and term_type != "All":
        q = q.filter(Terminology.term_type == term_type.lower())
    if search:
        s = f"%{search}%"
        q = q.filter((Terminology.term.ilike(s)) | (Terminology.replacement_suggestion.ilike(s)) | (Terminology.rationale.ilike(s)))
    return q.order_by(desc(Terminology.updated_at)).all()

@app.post("/api/knowledge/terminology")
def create_terminology(item: TerminologyCreate, db: Session = Depends(get_db)):
    obj = Terminology(**item.dict(), workspace_id=1)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@app.delete("/api/knowledge/terminology/{id}")
def delete_terminology(id: int, db: Session = Depends(get_db)):
    obj = db.query(Terminology).filter(Terminology.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(obj)
    db.commit()
    return {"message": "Deleted"}

# Tone & Voice
@app.get("/api/knowledge/tone")
def get_tone(db: Session = Depends(get_db)):
    return db.query(BrandToneVoice).all()

@app.post("/api/knowledge/tone")
def create_tone(item: ToneCreate, db: Session = Depends(get_db)):
    obj = BrandToneVoice(**item.dict(), workspace_id=1)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

# Approved Messaging
@app.get("/api/knowledge/messaging")
def get_messaging(db: Session = Depends(get_db)):
    return db.query(ApprovedMessaging).all()

@app.post("/api/knowledge/messaging")
def create_messaging(item: MessagingCreate, db: Session = Depends(get_db)):
    obj = ApprovedMessaging(**item.dict(), workspace_id=1)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

# PDF Upload & Parsing for Brand Guidelines
@app.post("/api/knowledge/upload-guideline-pdf")
async def upload_guideline_pdf(file: UploadFile = File(...), category: str = Form("General"), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_path = os.path.join(UPLOAD_DIR, f"guideline_{int(datetime.utcnow().timestamp())}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pdf_result = PDFService.extract_text_from_pdf(file_path)
    if not pdf_result["success"]:
        raise HTTPException(status_code=400, detail=f"PDF extraction error: {pdf_result.get('error')}")

    extracted_text = pdf_result["full_text"]
    title = pdf_result["metadata"]["title"] or file.filename.replace(".pdf", "").replace("_", " ").title()

    guideline = BrandGuideline(
        workspace_id=1,
        category=category,
        title=f"Brand Guideline: {title}",
        content=extracted_text[:4000],  # Store excerpt or clean body
        source_title=f"PDF Upload ({file.filename}, {pdf_result['total_pages']} pages)",
        tags="pdf, uploaded, guidelines",
        file_path=file_path
    )
    db.add(guideline)
    db.commit()
    db.refresh(guideline)

    return {
        "message": "PDF uploaded and parsed successfully",
        "guideline": guideline,
        "extraction_summary": {
            "total_pages": pdf_result["total_pages"],
            "total_characters": pdf_result["total_characters"],
            "preview": extracted_text[:300] + "..."
        }
    }

# -------------------------------------------------------------
# CONTENT SUBMISSION & ANALYZER MODULE
# -------------------------------------------------------------
@app.get("/api/submissions")
def list_submissions(status: Optional[str] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(ContentSubmission)
    if status and status != "All":
        q = q.filter(ContentSubmission.status == status)
    if category and category != "All":
        q = q.filter(ContentSubmission.category == category)
    return q.order_by(desc(ContentSubmission.updated_at)).all()

@app.get("/api/submissions/{id}")
def get_submission_detail(id: int, db: Session = Depends(get_db)):
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    findings = db.query(ComplianceFinding).filter(ComplianceFinding.submission_id == id).all()
    suggestions = db.query(CorrectionSuggestion).filter(CorrectionSuggestion.submission_id == id).all()
    comments = db.query(ReviewComment).filter(ReviewComment.submission_id == id).order_by(desc(ReviewComment.created_at)).all()
    revisions = db.query(RevisionHistory).filter(RevisionHistory.submission_id == id).order_by(desc(RevisionHistory.version_num)).all()
    approvals = db.query(ApprovalRecord).filter(ApprovalRecord.submission_id == id).order_by(desc(ApprovalRecord.created_at)).all()

    return {
        "submission": sub,
        "findings": findings,
        "suggestions": suggestions,
        "comments": comments,
        "revisions": revisions,
        "approvals": approvals
    }

@app.post("/api/submissions/text")
def submit_text(req: ContentSubmitRequest, db: Session = Depends(get_db)):
    sub = ContentSubmission(
        workspace_id=1,
        title=req.title,
        category=req.category,
        target_audience=req.target_audience or "Enterprise Customers",
        original_content=req.content,
        current_content=req.content,
        file_name=req.file_name or f"submission_{int(datetime.utcnow().timestamp())}.txt",
        file_type="text",
        status="draft",
        compliance_score=100.0,
        author_name="Elena Rostova"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    # Initial revision record
    rev = RevisionHistory(
        submission_id=sub.id,
        version_num=1,
        content_text=req.content,
        changes_summary="Initial draft created.",
        author_name="Elena Rostova",
        author_role="creator",
        status="draft"
    )
    db.add(rev)
    db.commit()

    return {
        "id": sub.id,
        "title": sub.title,
        "category": sub.category,
        "target_audience": sub.target_audience,
        "original_content": sub.original_content,
        "current_content": sub.current_content,
        "status": sub.status,
        "compliance_score": sub.compliance_score,
        "author_name": sub.author_name
    }

@app.post("/api/submissions/pdf")
async def submit_pdf(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form("Marketing Copy"),
    target_audience: str = Form("Enterprise Customers"),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_path = os.path.join(UPLOAD_DIR, f"sub_{int(datetime.utcnow().timestamp())}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pdf_result = PDFService.extract_text_from_pdf(file_path)
    if not pdf_result["success"] or not pdf_result["full_text"]:
        raise HTTPException(status_code=400, detail="Unable to extract text from this PDF.")

    extracted_text = pdf_result["full_text"]

    sub = ContentSubmission(
        workspace_id=1,
        title=title or file.filename.replace(".pdf", "").title(),
        category=category,
        target_audience=target_audience,
        original_content=extracted_text,
        current_content=extracted_text,
        file_name=file.filename,
        file_type="pdf",
        status="draft",
        compliance_score=100.0,
        author_name="Elena Rostova"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    rev = RevisionHistory(
        submission_id=sub.id,
        version_num=1,
        content_text=extracted_text,
        changes_summary=f"Extracted from PDF ({file.filename}, {pdf_result['total_pages']} pages).",
        author_name="Elena Rostova",
        author_role="creator",
        status="draft"
    )
    db.add(rev)
    db.commit()

    return {
        "id": sub.id,
        "title": sub.title,
        "category": sub.category,
        "target_audience": sub.target_audience,
        "original_content": sub.original_content,
        "current_content": sub.current_content,
        "status": sub.status,
        "compliance_score": sub.compliance_score,
        "author_name": sub.author_name
    }

# Trigger Analysis
@app.post("/api/analysis/{submission_id}/run")
def run_analysis(
    submission_id: int,
    x_gemini_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Clear previous findings and suggestions for a fresh analysis
    db.query(CorrectionSuggestion).filter(CorrectionSuggestion.submission_id == submission_id).delete()
    db.query(ComplianceFinding).filter(ComplianceFinding.submission_id == submission_id).delete()
    db.commit()

    # Run AI Analysis
    analysis_result = AIService.analyze_content(
        content=sub.current_content,
        category=sub.category,
        target_audience=sub.target_audience,
        db=db,
        workspace_id=sub.workspace_id,
        custom_api_key=x_gemini_api_key
    )

    findings_data = analysis_result.get("findings", [])
    new_findings = []

    for f in findings_data:
        finding = ComplianceFinding(
            submission_id=sub.id,
            category=f.get("category", "guideline"),
            issue_title=f.get("issue_title", "Brand Compliance Finding"),
            original_passage=f.get("original_passage", ""),
            explanation=f.get("explanation", ""),
            severity=f.get("severity", "medium"),
            reference_title=f.get("reference_title"),
            evidence_excerpt=f.get("evidence_excerpt"),
            uncertainty_note=f.get("uncertainty_note"),
            recommended_action=f.get("recommended_action", "Review and revise"),
            is_resolved=False
        )
        db.add(finding)
        db.commit()
        db.refresh(finding)
        new_findings.append(finding)

        # Create smart correction suggestion if available
        if f.get("suggested_replacement"):
            sugg = CorrectionSuggestion(
                finding_id=finding.id,
                submission_id=sub.id,
                original_sentence=f.get("original_passage") or sub.current_content[:100],
                suggested_replacement=f.get("suggested_replacement"),
                rationale=f.get("replacement_rationale", "Aligns with approved guidelines"),
                status="pending"
            )
            db.add(sugg)

    sub.compliance_score = float(analysis_result.get("compliance_score", 80))
    sub.status = "flagged" if len(findings_data) > 0 else "in_review"
    sub.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(sub)

    return {
        "submission": sub,
        "analysis": analysis_result,
        "findings_count": len(new_findings)
    }

# Update Content Manually
@app.put("/api/submissions/{id}/content")
def update_submission_content(
    id: int,
    req: ContentUpdateRequest,
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    sub.current_content = req.content
    sub.updated_at = datetime.utcnow()

    # Calculate latest version number
    latest_rev = db.query(RevisionHistory).filter(RevisionHistory.submission_id == id).order_by(desc(RevisionHistory.version_num)).first()
    next_ver = (latest_rev.version_num + 1) if latest_rev else 1

    rev = RevisionHistory(
        submission_id=sub.id,
        version_num=next_ver,
        content_text=req.content,
        changes_summary=req.changes_summary or f"Version {next_ver} updated.",
        author_name="Elena Rostova",
        author_role="creator",
        status=sub.status
    )
    db.add(rev)
    db.commit()
    db.refresh(sub)

    return {"message": "Content updated successfully", "submission": sub, "revision": rev}

# -------------------------------------------------------------
# SMART CORRECTIONS
# -------------------------------------------------------------
@app.post("/api/suggestions/{suggestion_id}/accept")
def accept_suggestion(suggestion_id: int, db: Session = Depends(get_db)):
    sugg = db.query(CorrectionSuggestion).filter(CorrectionSuggestion.id == suggestion_id).first()
    if not sugg:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    sub = db.query(ContentSubmission).filter(ContentSubmission.id == sugg.submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Replace original passage in content
    finding = db.query(ComplianceFinding).filter(ComplianceFinding.id == sugg.finding_id).first()
    target_passage = finding.original_passage if finding else sugg.original_sentence

    if target_passage in sub.current_content:
        sub.current_content = sub.current_content.replace(target_passage, sugg.suggested_replacement)
    else:
        # Fallback replace case-insensitive
        import re
        sub.current_content = re.sub(re.escape(target_passage), sugg.suggested_replacement, sub.current_content, flags=re.IGNORECASE)

    sugg.status = "accepted"
    if finding:
        finding.is_resolved = True

    # Re-evaluate compliance score (+5 to +10 boost upon resolution)
    sub.compliance_score = min(100.0, sub.compliance_score + 10.0)
    sub.updated_at = datetime.utcnow()

    # Log revision
    latest_rev = db.query(RevisionHistory).filter(RevisionHistory.submission_id == sub.id).order_by(desc(RevisionHistory.version_num)).first()
    next_ver = (latest_rev.version_num + 1) if latest_rev else 1

    rev = RevisionHistory(
        submission_id=sub.id,
        version_num=next_ver,
        content_text=sub.current_content,
        changes_summary=f"Accepted AI suggestion for {finding.issue_title if finding else 'compliance issue'}.",
        author_name="Elena Rostova",
        author_role="creator",
        status=sub.status
    )
    db.add(rev)
    db.commit()

    return {"message": "Suggestion accepted", "current_content": sub.current_content, "compliance_score": sub.compliance_score}

@app.post("/api/suggestions/{suggestion_id}/reject")
def reject_suggestion(suggestion_id: int, db: Session = Depends(get_db)):
    sugg = db.query(CorrectionSuggestion).filter(CorrectionSuggestion.id == suggestion_id).first()
    if not sugg:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    sugg.status = "rejected"
    db.commit()
    return {"message": "Suggestion rejected"}

# -------------------------------------------------------------
# HUMAN REVIEW & APPROVAL WORKFLOW
# -------------------------------------------------------------
@app.post("/api/submissions/{id}/comments")
def add_review_comment(id: int, req: ReviewCommentRequest, x_user_role: Optional[str] = Header(None), db: Session = Depends(get_db)):
    role = (x_user_role or "reviewer").lower()
    user = db.query(User).filter(User.role == role).first()
    author_name = user.full_name if user else "Marcus Vance"
    
    comment = ReviewComment(
        submission_id=id,
        author_id=user.id if user else 3,
        author_name=author_name,
        author_role=role,
        comment_text=req.comment_text
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@app.post("/api/submissions/{id}/decision")
def make_review_decision(id: int, req: ReviewDecisionRequest, x_user_role: Optional[str] = Header(None), db: Session = Depends(get_db)):
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    decision = req.decision.lower()
    if decision not in ["approved", "changes_requested", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid decision. Must be approved, changes_requested, or rejected.")

    user = db.query(User).filter(User.role == (x_user_role or "reviewer").lower()).first()
    reviewer_name = user.full_name if user else "Marcus Vance"

    sub.status = decision
    sub.updated_at = datetime.utcnow()

    # Record decision audit
    approval = ApprovalRecord(
        submission_id=sub.id,
        reviewer_id=user.id if user else 3,
        reviewer_name=reviewer_name,
        decision=decision,
        notes=req.notes
    )
    db.add(approval)

    # Record revision history
    latest_rev = db.query(RevisionHistory).filter(RevisionHistory.submission_id == id).order_by(desc(RevisionHistory.version_num)).first()
    next_ver = (latest_rev.version_num + 1) if latest_rev else 1

    rev = RevisionHistory(
        submission_id=sub.id,
        version_num=next_ver,
        content_text=sub.current_content,
        changes_summary=f"Review decision by {reviewer_name}: {decision.replace('_', ' ').upper()}. Notes: {req.notes or 'None'}",
        author_name=reviewer_name,
        author_role="reviewer",
        status=decision
    )
    db.add(rev)
    db.commit()
    db.refresh(sub)

    return {"message": f"Content successfully marked as {decision}", "submission": sub, "approval": approval}

# -------------------------------------------------------------
# GOVERNANCE INSIGHTS & ANALYTICS
# -------------------------------------------------------------
@app.get("/api/analytics/dashboard")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    total_reviews = db.query(ContentSubmission).count()
    approved_count = db.query(ContentSubmission).filter(ContentSubmission.status == "approved").count()
    pending_count = db.query(ContentSubmission).filter(ContentSubmission.status.in_(["draft", "in_review"])).count()
    flagged_count = db.query(ContentSubmission).filter(ContentSubmission.status == "flagged").count()
    total_issues = db.query(ComplianceFinding).count()
    resolved_issues = db.query(ComplianceFinding).filter(ComplianceFinding.is_resolved == True).count()

    # Category distribution of findings
    categories = db.query(ComplianceFinding.category).all()
    cat_counts = {}
    for c in categories:
        cat_counts[c[0]] = cat_counts.get(c[0], 0) + 1

    # Severity distribution
    severities = db.query(ComplianceFinding.severity).all()
    sev_counts = {}
    for s in severities:
        sev_counts[s[0]] = sev_counts.get(s[0], 0) + 1

    # Recent submissions
    recent_subs = db.query(ContentSubmission).order_by(desc(ContentSubmission.updated_at)).limit(5).all()

    return {
        "kpis": {
            "total_reviews": total_reviews,
            "approved": approved_count,
            "pending_reviews": pending_count,
            "flagged_content": flagged_count,
            "total_issues": total_issues,
            "resolved_issues": resolved_issues,
            "governance_health_score": 92.4,
            "avg_turnaround_hours": 3.8
        },
        "violation_categories": [
            {"name": k.replace("_", " ").title(), "count": v}
            for k, v in cat_counts.items()
        ] or [
            {"name": "Terminology", "count": 14},
            {"name": "Unsupported Claims", "count": 9},
            {"name": "Tone & Voice", "count": 6},
            {"name": "Outdated Facts", "count": 5},
            {"name": "Brand Guidelines", "count": 3}
        ],
        "severity_distribution": [
            {"name": k.replace("_", " ").title(), "count": v}
            for k, v in sev_counts.items()
        ] or [
            {"name": "Critical", "count": 4},
            {"name": "High", "count": 8},
            {"name": "Medium", "count": 12},
            {"name": "Needs Verification", "count": 7}
        ],
        "recent_submissions": recent_subs
    }

@app.get("/api/analytics/governance-insights")
def get_governance_insights(db: Session = Depends(get_db)):
    return {
        "monthly_trends": [
            {"month": "Jun", "reviews": 18, "approved": 15, "violations": 24},
            {"month": "Jul", "reviews": 25, "approved": 20, "violations": 31},
            {"month": "Aug", "reviews": 32, "approved": 27, "violations": 28},
            {"month": "Sep", "reviews": 44, "approved": 38, "violations": 36},
            {"month": "Oct", "reviews": 56, "approved": 49, "violations": 42},
            {"month": "Nov", "reviews": 68, "approved": 61, "violations": 26}
        ],
        "category_breakdown": [
            {"category": "Press Releases", "total": 24, "compliance_avg": 88, "critical_issues": 3},
            {"category": "Blog Posts", "total": 42, "compliance_avg": 94, "critical_issues": 1},
            {"category": "Product Docs", "total": 35, "compliance_avg": 96, "critical_issues": 0},
            {"category": "Marketing Copy", "total": 51, "compliance_avg": 82, "critical_issues": 8},
            {"category": "Email Campaigns", "total": 29, "compliance_avg": 91, "critical_issues": 2}
        ],
        "top_infractions": [
            {"term": "cheap", "type": "Prohibited Term", "occurrences": 19, "preferred": "cost-effective"},
            {"term": "100% bug-free", "type": "Absolute Guarantee", "occurrences": 14, "preferred": "fault-tolerant"},
            {"term": "best in the world", "type": "Unsupported Superlative", "occurrences": 11, "preferred": "industry-validated"},
            {"term": "bulletproof", "type": "Prohibited Term", "occurrences": 9, "preferred": "enterprise-resilient"}
        ],
        "turnaround_metrics": {
            "avg_hours": 3.8,
            "same_day_pct": 84,
            "revisions_per_approval": 1.4
        }
    }
