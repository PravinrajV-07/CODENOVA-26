from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
from models import (
    User, Workspace, WorkspaceMember, BrandGuideline, BrandFact,
    Terminology, BrandToneVoice, ApprovedMessaging, ContentSubmission,
    ComplianceFinding, CorrectionSuggestion, ReviewComment, RevisionHistory, ApprovalRecord
)

def init_db_and_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Workspace).first():
        db.close()
        return

    print("[Seed] Initializing BrandCue AI database with enterprise seed data...")

    # 1. Create Workspace
    ws = Workspace(
        name="ApexCloud Technologies",
        slug="apexcloud-global",
        description="Global Enterprise AI & Cloud Governance Workspace"
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    # 2. Create Users
    admin_user = User(
        email="sarah.lin@apexcloud.io",
        full_name="Sarah Lin",
        role="admin",
        avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    )
    creator_user = User(
        email="elena.rostova@apexcloud.io",
        full_name="Elena Rostova",
        role="creator",
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    )
    reviewer_user = User(
        email="marcus.vance@apexcloud.io",
        full_name="Marcus Vance",
        role="reviewer",
        avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    )
    db.add_all([admin_user, creator_user, reviewer_user])
    db.commit()

    # 3. Workspace Members
    for u in [admin_user, creator_user, reviewer_user]:
        db.add(WorkspaceMember(workspace_id=ws.id, user_id=u.id, role=u.role))
    db.commit()

    # 4. Brand Guidelines
    guidelines = [
        BrandGuideline(
            workspace_id=ws.id,
            category="Voice & Tone",
            title="Global Editorial Voice Standards",
            content="ApexCloud communicates with authority, clarity, and precision. We address technical leaders and enterprise architects. Avoid colloquial slang, hyperbolic guarantees, aggressive competitive attacks, and condescending language. Every quantitative claim must be backed by reproducible benchmark data.",
            source_title="ApexCloud Corporate Brand Book 2026",
            tags="voice, editorial, tone, precision"
        ),
        BrandGuideline(
            workspace_id=ws.id,
            category="Visual Identity",
            title="Color Palette and Logo Usage Guidelines",
            content="Primary brand colors are Deep Navy (#0F172A), Electric Indigo (#6366F1), and Cyber Blue (#38BDF8). Logo clearspace must equal at least the height of the primary 'A' glyph (minimum 24px). Do not alter aspect ratio or place logo over cluttered photographic backgrounds.",
            source_title="Brand Asset Kit v4.2",
            tags="visual, logo, color, typography"
        ),
        BrandGuideline(
            workspace_id=ws.id,
            category="Legal & Compliance",
            title="Regulatory & Promotional Claims Protocol",
            content="Never describe software as 'unbreakable', 'bulletproof', or '100% bug-free'. Such terminology exposes the company to breach of warranty claims under commercial UCC rules. All uptime claims must reference the approved Service Level Agreement (SLA).",
            source_title="Legal Risk Advisory - Marketing Disclaimers",
            tags="legal, claims, warranties, liability"
        )
    ]
    db.add_all(guidelines)

    # 5. Approved Brand Facts
    facts = [
        BrandFact(
            workspace_id=ws.id,
            category="Company",
            claim="Founding Year and Leadership",
            approved_wording="Founded in 2021 by distributed systems researchers in Boston, MA.",
            verification_source="SEC Form D & Corporate Registry"
        ),
        BrandFact(
            workspace_id=ws.id,
            category="Operational SLA",
            claim="Official Platform Uptime SLA",
            approved_wording="99.95% high-availability uptime SLA across all multi-region clusters.",
            verification_source="Master Services Agreement (MSA) Schedule C"
        ),
        BrandFact(
            workspace_id=ws.id,
            category="Security & Compliance",
            claim="Security Compliance Standards",
            approved_wording="SOC2 Type II certified, ISO/IEC 27001 accredited, and HIPAA ready infrastructure.",
            verification_source="Annual Ernst & Young SOC2 Type II Audit Report"
        ),
        BrandFact(
            workspace_id=ws.id,
            category="Market Adoption",
            claim="Enterprise Customer Traction",
            approved_wording="Trusted by over 450 enterprise customers, including 18 of the Fortune 500.",
            verification_source="Q3 2026 Board of Directors Investor Deck"
        )
    ]
    db.add_all(facts)

    # 6. Terminology Rules
    terms = [
        Terminology(
            workspace_id=ws.id,
            term="bulletproof",
            term_type="prohibited",
            replacement_suggestion="enterprise-resilient",
            rationale="Hyperbolic claim. Software cannot be legally warranted as impenetrable."
        ),
        Terminology(
            workspace_id=ws.id,
            term="cheap",
            term_type="prohibited",
            replacement_suggestion="cost-effective",
            rationale="Degrades premium brand perception in enterprise tier negotiations."
        ),
        Terminology(
            workspace_id=ws.id,
            term="100% bug-free",
            term_type="prohibited",
            replacement_suggestion="rigorously tested and fault-tolerant",
            rationale="Technically inaccurate and exposes the business to warranty breach."
        ),
        Terminology(
            workspace_id=ws.id,
            term="foolproof",
            term_type="prohibited",
            replacement_suggestion="intuitive and error-preventing",
            rationale="Patronizing tone towards enterprise operators."
        ),
        Terminology(
            workspace_id=ws.id,
            term="disruptor",
            term_type="prohibited",
            replacement_suggestion="industry innovator",
            rationale="Overused industry jargon that conveys instability rather than enterprise readiness."
        ),
        Terminology(
            workspace_id=ws.id,
            term="CloudMesh Engine",
            term_type="preferred",
            replacement_suggestion=None,
            rationale="Official proprietary name for our distributed container orchestration layer."
        )
    ]
    db.add_all(terms)

    # 7. Brand Tone & Voice
    tones = [
        BrandToneVoice(
            workspace_id=ws.id,
            dimension_name="Authoritative & Precise",
            guidelines="Speak directly with technical confidence. Ground statements in measurable performance metrics and architectural design rather than promotional hype.",
            positive_examples="Our distributed state machine ensures linearizable reads across geographically dispersed replicas with sub-10ms p99 latency.",
            negative_examples="We have the craziest fast database you guys have ever seen! It totally destroys AWS!"
        ),
        BrandToneVoice(
            workspace_id=ws.id,
            dimension_name="Empowering & Solution-Oriented",
            guidelines="Highlight developer autonomy and enterprise risk reduction. Focus on how operators gain control over cloud sprawl.",
            positive_examples="Engineers can autonomously provision certified staging environments in minutes without compromising security guardrails.",
            negative_examples="If you don't buy our tool, your developers will keep making stupid mistakes."
        )
    ]
    db.add_all(tones)

    # 8. Approved Messaging
    msgs = [
        ApprovedMessaging(
            workspace_id=ws.id,
            message_type="Tagline",
            title="Primary Corporate Tagline",
            approved_copy="Every Content. One Consistent Brand.",
            audience="All External & Internal Audiences",
            context="Primary footer, email sign-offs, conference booths, hero banners."
        ),
        ApprovedMessaging(
            workspace_id=ws.id,
            message_type="Value Proposition",
            title="Core Enterprise Value Proposition",
            approved_copy="ApexCloud unifies brand intelligence, cloud governance, and multi-region automation into a single authoritative control plane.",
            audience="CIO, CTO, Head of Brand Marketing",
            context="Pitch decks, homepage sub-hero, executive summaries."
        )
    ]
    db.add_all(msgs)
    db.commit()

    # 9. Pre-seed Submissions with complete Findings & Suggestions for instant interactive testing!
    # Submission 1: Flagged draft with violations
    sub1_content = """ApexCloud CloudMesh 2.0 is the best in the world cloud orchestration platform. 
Our groundbreaking solution is completely foolproof and delivers a 100% bug-free deployment pipeline that completely crushes the competition.
Unlike other tools that charge exorbitant fees, our platform is super cheap and guarantees a 99.999% uptime SLA for every single workload.
Founded in 2018, we have helped hundreds of organizations modernize their stacks with bulletproof reliability."""

    sub1 = ContentSubmission(
        workspace_id=ws.id,
        title="Q4 Press Release: CloudMesh 2.0 Launch",
        category="Press Release",
        target_audience="Enterprise Developers & IT Leaders",
        original_content=sub1_content,
        current_content=sub1_content,
        file_name="press_release_draft_v1.txt",
        file_type="text",
        status="flagged",
        compliance_score=45.0,
        created_by=creator_user.id,
        author_name=creator_user.full_name,
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    db.add(sub1)
    db.commit()
    db.refresh(sub1)

    # Findings for Submission 1
    f1 = ComplianceFinding(
        submission_id=sub1.id,
        category="unsupported_claim",
        issue_title="Unsubstantiated '#1' Superlative Claim",
        original_passage="best in the world",
        explanation="The phrase 'best in the world' is an unverified promotional superlative that lacks objective benchmark validation.",
        severity="needs_verification",
        reference_title="Brand Messaging & Fact Verification Policy",
        evidence_excerpt="All public-facing claims must be substantiated by official benchmarks, certified SLAs, or validated audit reports.",
        uncertainty_note="IMPORTANT: Missing supporting evidence does not automatically imply false information. This claim is currently unsupported by supplied references and requires human verification.",
        recommended_action="Rephrase to benchmark-validated or peer-recognized terminology.",
        is_resolved=False
    )
    f2 = ComplianceFinding(
        submission_id=sub1.id,
        category="terminology",
        issue_title="Prohibited Term: 'foolproof'",
        original_passage="foolproof",
        explanation="The term 'foolproof' is prohibited. It violates brand tone guidelines by sounding patronizing to enterprise operators.",
        severity="high",
        reference_title="Brand Terminology Matrix: 'foolproof'",
        evidence_excerpt="Prohibited: 'foolproof'. Preferred alternative: 'intuitive and error-preventing'. Reason: Patronizing tone.",
        uncertainty_note="Direct prohibited term match in approved knowledge base.",
        recommended_action="Replace 'foolproof' with 'intuitive and error-preventing'.",
        is_resolved=False
    )
    f3 = ComplianceFinding(
        submission_id=sub1.id,
        category="terminology",
        issue_title="Absolute Guarantee Claim: '100% bug-free'",
        original_passage="100% bug-free",
        explanation="Declaring software '100% bug-free' creates legal liability under commercial warranty laws and contradicts our engineering policies.",
        severity="critical",
        reference_title="Legal Risk Advisory - Marketing Disclaimers",
        evidence_excerpt="Never describe software as 'unbreakable', 'bulletproof', or '100% bug-free'. Such terminology exposes the company to breach of warranty claims.",
        uncertainty_note="Confirmed critical compliance violation under corporate legal policy.",
        recommended_action="Replace with 'rigorously tested and fault-tolerant'.",
        is_resolved=False
    )
    f4 = ComplianceFinding(
        submission_id=sub1.id,
        category="terminology",
        issue_title="Prohibited Term: 'cheap'",
        original_passage="cheap",
        explanation="The word 'cheap' degrades enterprise positioning and brand equity during high-value commercial sales cycles.",
        severity="high",
        reference_title="Brand Terminology Matrix: 'cheap'",
        evidence_excerpt="Prohibited: 'cheap'. Preferred alternative: 'cost-effective / competitive TCO'.",
        uncertainty_note="Direct vocabulary policy violation.",
        recommended_action="Replace 'cheap' with 'cost-effective'.",
        is_resolved=False
    )
    f5 = ComplianceFinding(
        submission_id=sub1.id,
        category="outdated_fact",
        issue_title="Inconsistent SLA Claim: '99.999% uptime SLA'",
        original_passage="99.999% uptime SLA",
        explanation="The draft claims '99.999% uptime SLA' (five nines), but our verified Master Services Agreement SLA is 99.95% (three and a half nines).",
        severity="critical",
        reference_title="Approved Brand Fact: Official Platform Uptime SLA",
        evidence_excerpt="99.95% high-availability uptime SLA across all multi-region clusters.",
        uncertainty_note="Direct discrepancy with binding legal SLA schedule.",
        recommended_action="Correct SLA figure to 99.95%.",
        is_resolved=False
    )
    f6 = ComplianceFinding(
        submission_id=sub1.id,
        category="outdated_fact",
        issue_title="Incorrect Founding Date: 'Founded in 2018'",
        original_passage="Founded in 2018",
        explanation="ApexCloud was founded in 2021, not 2018. Inaccurate corporate history undermines trust with enterprise procurement.",
        severity="high",
        reference_title="Approved Brand Fact: Founding Year and Leadership",
        evidence_excerpt="Founded in 2021 by distributed systems researchers in Boston, MA.",
        uncertainty_note="Direct discrepancy with official corporate registry.",
        recommended_action="Update founding year to 2021.",
        is_resolved=False
    )
    db.add_all([f1, f2, f3, f4, f5, f6])
    db.commit()

    # Correction suggestions for Submission 1
    s1 = CorrectionSuggestion(
        finding_id=f1.id,
        submission_id=sub1.id,
        original_sentence="ApexCloud CloudMesh 2.0 is the best in the world cloud orchestration platform.",
        suggested_replacement="ApexCloud CloudMesh 2.0 is an industry-leading, benchmark-validated cloud orchestration platform.",
        rationale="Softens unverified superlative to an objective, defensible standard while retaining marketing strength.",
        status="pending"
    )
    s2 = CorrectionSuggestion(
        finding_id=f2.id,
        submission_id=sub1.id,
        original_sentence="Our groundbreaking solution is completely foolproof and delivers a 100% bug-free deployment pipeline that completely crushes the competition.",
        suggested_replacement="Our groundbreaking solution is intuitive, error-preventing, and delivers a rigorously tested, fault-tolerant deployment pipeline designed for mission-critical reliability.",
        rationale="Eliminates prohibited terms ('foolproof', '100% bug-free') and aggressive tone ('crushes the competition').",
        status="pending"
    )
    s3 = CorrectionSuggestion(
        finding_id=f4.id,
        submission_id=sub1.id,
        original_sentence="Unlike other tools that charge exorbitant fees, our platform is super cheap and guarantees a 99.999% uptime SLA for every single workload.",
        suggested_replacement="Unlike legacy alternatives with unpredictable pricing, our platform delivers a cost-effective total cost of ownership and guarantees a 99.95% uptime SLA for every mission-critical workload.",
        rationale="Replaces 'cheap' with 'cost-effective' and corrects SLA figure from 99.999% to verified 99.95%.",
        status="pending"
    )
    s4 = CorrectionSuggestion(
        finding_id=f6.id,
        submission_id=sub1.id,
        original_sentence="Founded in 2018, we have helped hundreds of organizations modernize their stacks with bulletproof reliability.",
        suggested_replacement="Founded in 2021, we have helped over 450 enterprise organizations modernize their stacks with enterprise-resilient reliability.",
        rationale="Corrects founding year to 2021, cites verified customer figure (over 450), and replaces prohibited 'bulletproof'.",
        status="pending"
    )
    db.add_all([s1, s2, s3, s4])

    # Initial Revision History for Submission 1
    rev1 = RevisionHistory(
        submission_id=sub1.id,
        version_num=1,
        content_text=sub1_content,
        changes_summary="Initial draft submitted for automated BrandCue AI compliance analysis.",
        author_name=creator_user.full_name,
        author_role="creator",
        status="flagged",
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    db.add(rev1)

    # Initial Review Comment
    c1 = ReviewComment(
        submission_id=sub1.id,
        author_id=reviewer_user.id,
        author_name=reviewer_user.full_name,
        author_role="reviewer",
        comment_text="Elena, please review the SLA claim and prohibited wording before we can approve this press release for distribution. Legal will reject 99.999%.",
        created_at=datetime.utcnow() - timedelta(hours=2)
    )
    db.add(c1)

    # Submission 2: In Review
    sub2_content = """ApexCloud provides enterprise organizations with an automated brand and infrastructure governance control plane.
Built on zero-trust security standards, our platform ensures SOC2 Type II compliance and verified 99.95% uptime SLA.
Our technical documentation adheres to verified precision and clear editorial guidelines."""

    sub2 = ContentSubmission(
        workspace_id=ws.id,
        title="Product Brief: Enterprise Governance Architecture",
        category="Product Spec",
        target_audience="Chief Information Security Officers",
        original_content=sub2_content,
        current_content=sub2_content,
        file_name="product_brief_architecture.txt",
        file_type="text",
        status="in_review",
        compliance_score=94.0,
        created_by=creator_user.id,
        author_name=creator_user.full_name,
        created_at=datetime.utcnow() - timedelta(days=1)
    )
    db.add(sub2)
    db.commit()

    # Submission 3: Approved
    sub3_content = """Finova Bank accelerates digital transformation with ApexCloud.
By adopting the CloudMesh Engine, Finova reduced deployment cycle latency by 68% while maintaining SOC2 Type II certified data governance across their multi-region banking applications.
ApexCloud empowers enterprise engineers to build with speed without sacrificing regulatory assurance."""

    sub3 = ContentSubmission(
        workspace_id=ws.id,
        title="Customer Case Study: Finova Bank Migration",
        category="Blog Post",
        target_audience="Financial Services IT Executives",
        original_content=sub3_content,
        current_content=sub3_content,
        file_name="case_study_finova_bank.txt",
        file_type="text",
        status="approved",
        compliance_score=98.0,
        created_by=creator_user.id,
        author_name=creator_user.full_name,
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    db.add(sub3)
    db.commit()

    app3 = ApprovalRecord(
        submission_id=sub3.id,
        reviewer_id=reviewer_user.id,
        reviewer_name=reviewer_user.full_name,
        decision="approved",
        notes="All brand facts, customer claims, and terminology strictly conform to Brand Book v4.2. Approved for external release.",
        created_at=datetime.utcnow() - timedelta(days=1)
    )
    db.add(app3)

    db.commit()
    db.close()
    print("[Seed] Successfully seeded ApexCloud BrandCue AI workspace and data.")
