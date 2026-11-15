import pymupdf as fitz
import os
from typing import Dict, Any, List

class PDFService:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> Dict[str, Any]:
        """
        Extract structured text, page count, and metadata from supported text-based PDF using PyMuPDF.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            doc = fitz.open(file_path)
            total_pages = len(doc)
            pages_text: List[Dict[str, Any]] = []
            full_text_list: List[str] = []

            for page_num in range(total_pages):
                page = doc[page_num]
                text = page.get_text("text").strip()
                if text:
                    pages_text.append({
                        "page_number": page_num + 1,
                        "char_count": len(text),
                        "text": text
                    })
                    full_text_list.append(text)

            metadata = doc.metadata or {}
            doc.close()

            full_text = "\n\n".join(full_text_list)
            
            return {
                "success": True,
                "total_pages": total_pages,
                "pages_with_text": len(pages_text),
                "total_characters": len(full_text),
                "metadata": {
                    "title": metadata.get("title", "") or os.path.basename(file_path),
                    "author": metadata.get("author", ""),
                    "creator": metadata.get("creator", ""),
                    "producer": metadata.get("producer", "")
                },
                "pages": pages_text,
                "full_text": full_text
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "full_text": ""
            }
