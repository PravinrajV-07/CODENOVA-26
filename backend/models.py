from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="creator")  # admin, creator, reviewer
    avatar = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(50), default="creator")
    created_at = Column(DateTime, default=datetime.utcnow)

class BrandGuideline(Base):
    __tablename__ = "brand_guidelines"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), default=1)
    category = Column(String(100), nullable=False)  # Tone, Visual, Positioning, Governance, Architecture
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    source_title = Column(String(255), nullable=True)
    tags = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BrandFact(Base):
    __tablename__ = "brand_facts"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), default=1)
    category = Column(String(100), nullable=False)  # Security, Compliance, Metrics, Company, Product
    claim = Column(String(255), nullable=False)
    approved_wording = Column(Text, nullable=False)
    verification_source = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Terminology(Base):
    __tablename__ = "terminologies"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), default=1)
    term = Column(String(255), nullable=False, index=True)
    term_type = Column(String(50), nullable=False)  # prohibited, preferred
    replacement_suggestion = Column(String(255), nullable=True)
    rationale = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BrandToneVoice(Base):
    __tablename__ = "brand_tone_voice"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), default=1)
    dimension_name = Column(String(100), nullable=False)  # e.g., Authoritative vs Accessible
    guidelines = Column(Text, nullable=False)
    positive_examples = Column(Text, nullable=True)
    negative_examples = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ApprovedMessaging(Base):
    __tablename__ = "approved_messaging"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), default=1)
    message_type = Column(String(100), nullable=False)  # Tagline, Value Proposition, Elevator Pitch, Mission
    title = Column(String(255), nullable=False)
    approved_copy = Column(Text, nullable=False)
    audience = Column(String(100), nullable=True)
    context = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ContentSubmission(Base):
    __tablename__ = "content_submissions"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), default=1)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # Blog Post, Press Release, Landing Page, Ad Copy, Product Spec, Email
    target_audience = Column(String(100), default="Enterprise Customers")
    original_content = Column(Text, nullable=False)
    current_content = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=True)
    file_type = Column(String(50), default="text")  # text, pdf
    status = Column(String(50), default="draft")  # draft, flagged, in_review, changes_requested, approved, rejected
    compliance_score = Column(Float, default=100.0)
    created_by = Column(Integer, ForeignKey("users.id"), default=2)
    author_name = Column(String(255), default="Elena Rostova")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    findings = relationship("ComplianceFinding", back_populates="submission", cascade="all, delete-orphan")
    comments = relationship("ReviewComment", back_populates="submission", cascade="all, delete-orphan")
    revisions = relationship("RevisionHistory", back_populates="submission", cascade="all, delete-orphan")
    approvals = relationship("ApprovalRecord", back_populates="submission", cascade="all, delete-orphan")

class ComplianceFinding(Base):
    __tablename__ = "compliance_findings"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("content_submissions.id"), nullable=False)
    category = Column(String(100), nullable=False)  # tone, terminology, messaging, unsupported_claim, outdated_fact, guideline
    issue_title = Column(String(255), nullable=False)
    original_passage = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    severity = Column(String(50), default="medium")  # critical, high, medium, low, needs_verification
    reference_title = Column(String(255), nullable=True)
    evidence_excerpt = Column(Text, nullable=True)
    uncertainty_note = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("ContentSubmission", back_populates="findings")
    suggestions = relationship("CorrectionSuggestion", back_populates="finding", cascade="all, delete-orphan")

class CorrectionSuggestion(Base):
    __tablename__ = "correction_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    finding_id = Column(Integer, ForeignKey("compliance_findings.id"), nullable=False)
    submission_id = Column(Integer, ForeignKey("content_submissions.id"), nullable=False)
    original_sentence = Column(Text, nullable=False)
    suggested_replacement = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    status = Column(String(50), default="pending")  # pending, accepted, rejected, edited
    created_at = Column(DateTime, default=datetime.utcnow)

    finding = relationship("ComplianceFinding", back_populates="suggestions")

class ReviewComment(Base):
    __tablename__ = "review_comments"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("content_submissions.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), default=3)
    author_name = Column(String(255), default="Marcus Vance")
    author_role = Column(String(50), default="reviewer")
    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("ContentSubmission", back_populates="comments")

class RevisionHistory(Base):
    __tablename__ = "revision_histories"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("content_submissions.id"), nullable=False)
    version_num = Column(Integer, nullable=False)
    content_text = Column(Text, nullable=False)
    changes_summary = Column(Text, nullable=False)
    author_name = Column(String(255), nullable=False)
    author_role = Column(String(50), nullable=False)
    status = Column(String(50), default="in_review")
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("ContentSubmission", back_populates="revisions")

class ApprovalRecord(Base):
    __tablename__ = "approval_records"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("content_submissions.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), default=3)
    reviewer_name = Column(String(255), default="Marcus Vance")
    decision = Column(String(50), nullable=False)  # approved, changes_requested, rejected
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("ContentSubmission", back_populates="approvals")
