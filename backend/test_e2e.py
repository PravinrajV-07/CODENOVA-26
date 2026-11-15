import urllib.request
import json
import pymupdf as fitz
import os

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("--- 1. Testing Knowledge Base Overview ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/knowledge/overview")
    kb_data = json.loads(req.read().decode())
    print("Knowledge base counts:", kb_data)
    assert kb_data["guidelines_count"] >= 3
    assert kb_data["prohibited_count"] >= 4

    print("\n--- 2. Testing Submissions List ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/submissions")
    subs = json.loads(req.read().decode())
    print(f"Retrieved {len(subs)} submissions")
    assert len(subs) >= 3

    print("\n--- 3. Testing Text Submission & Live AI Governance Analysis ---")
    test_content = {
        "title": "Automated Test Press Release",
        "category": "Press Release",
        "target_audience": "Enterprise CIOs",
        "content": "ApexCloud is the best in the world cloud platform. Our solution is completely foolproof and 100% bug-free. We guarantee a 99.999% uptime SLA at a very cheap price."
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/submissions/text",
        data=json.dumps(test_content).encode(),
        headers={"Content-Type": "application/json"}
    )
    sub_res = json.loads(urllib.request.urlopen(req).read().decode())
    new_id = sub_res["id"]
    print(f"Created submission ID {new_id}: '{sub_res['title']}'")

    print(f"\n--- 4. Running AI Compliance Engine on Submission {new_id} ---")
    req_analysis = urllib.request.Request(
        f"{BASE_URL}/api/analysis/{new_id}/run",
        data=b"",
        headers={"Content-Type": "application/json"}
    )
    analysis_res = json.loads(urllib.request.urlopen(req_analysis).read().decode())
    print(f"Compliance Score: {analysis_res['submission']['compliance_score']}%")
    print(f"Findings Generated: {analysis_res['findings_count']}")
    assert analysis_res['findings_count'] >= 4

    print("\n--- 5. Inspecting Submission Details & Evidence Citation ---")
    detail_res = json.loads(urllib.request.urlopen(f"{BASE_URL}/api/submissions/{new_id}").read().decode())
    findings = detail_res["findings"]
    suggestions = detail_res["suggestions"]
    print(f"Found {len(findings)} findings and {len(suggestions)} smart suggestions")

    # Check evidence citation and uncertainty note
    f_unsupported = next((f for f in findings if f["category"] == "unsupported_claim"), None)
    if f_unsupported:
        print(f"Unsupported claim finding: '{f_unsupported['issue_title']}'")
        print(f"Uncertainty note: '{f_unsupported['uncertainty_note'][:80]}...'")
        print(f"Evidence reference: '{f_unsupported['reference_title']}'")
        assert "human verification" in f_unsupported['uncertainty_note']

    print("\n--- 6. Testing Smart Correction Acceptance ---")
    if suggestions:
        sugg = suggestions[0]
        print(f"Accepting suggestion ID {sugg['id']}: '{sugg['suggested_replacement']}'")
        req_accept = urllib.request.Request(
            f"{BASE_URL}/api/suggestions/{sugg['id']}/accept",
            data=b"",
            headers={"Content-Type": "application/json"}
        )
        accept_res = json.loads(urllib.request.urlopen(req_accept).read().decode())
        print("Updated content after accepting suggestion:")
        print(accept_res["current_content"])
        print(f"New compliance score: {accept_res['compliance_score']}%")

    print("\n--- 7. Testing Reviewer Comment Thread & Formal Approval Decision ---")
    req_comment = urllib.request.Request(
        f"{BASE_URL}/api/submissions/{new_id}/comments",
        data=json.dumps({"comment_text": "Revisions have been verified against Brand Book v4.2."}).encode(),
        headers={"Content-Type": "application/json", "x-user-role": "reviewer"}
    )
    comm_res = json.loads(urllib.request.urlopen(req_comment).read().decode())
    print(f"Added comment by {comm_res['author_name']} ({comm_res['author_role']})")

    req_decision = urllib.request.Request(
        f"{BASE_URL}/api/submissions/{new_id}/decision",
        data=json.dumps({"decision": "approved", "notes": "Approved for enterprise press wire."}).encode(),
        headers={"Content-Type": "application/json", "x-user-role": "reviewer"}
    )
    dec_res = json.loads(urllib.request.urlopen(req_decision).read().decode())
    print(f"Decision recorded: Status is now '{dec_res['submission']['status']}'")
    assert dec_res['submission']['status'] == "approved"

    print("\n--- 8. Testing PyMuPDF Guideline PDF Generation and Parsing ---")
    # Create sample PDF using PyMuPDF
    pdf_path = os.path.join(os.path.dirname(__file__), "sample_brand_guidelines.pdf")
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), "ApexCloud Corporate Identity & Guideline v4.2\n\nRule 1: Always communicate with technical clarity.\nRule 2: Never use colloquial words like cheap or bulletproof.\nRule 3: Certified SLA is 99.95% high-availability uptime.", fontsize=12)
    doc.save(pdf_path)
    doc.close()

    from services.pdf_service import PDFService
    pdf_result = PDFService.extract_text_from_pdf(pdf_path)
    print(f"PyMuPDF extracted {pdf_result['total_pages']} pages, {pdf_result['total_characters']} characters.")
    assert "99.95%" in pdf_result["full_text"]
    print("PDF text extraction verified successfully!")

    print("\n=======================================================")
    print("ALL END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    test_api()
