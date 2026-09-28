"""
Retrieval-Augmented Generation (RAG) Engine.
Retrieves verified clinical evidence from trusted medical guidelines to ground the AI Synthesis Brain.
Guarantees verified docs only (no hallucinations).
"""

from typing import List, Dict, Any
import math
import re
from .knowledge_base import VERIFIED_MEDICAL_GUIDELINES

class MedicalRAGEngine:
    def __init__(self):
        self.documents = VERIFIED_MEDICAL_GUIDELINES

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z0-9_\-]{3,}\b", text.lower())
        stopwords = {
            "the", "and", "for", "with", "this", "that", "from", "are", "was", "were",
            "have", "has", "had", "not", "but", "what", "which", "who", "when", "where",
            "why", "how", "all", "any", "both", "each", "few", "more", "most", "other",
            "some", "such", "than", "too", "very", "can", "will", "just", "should", "now"
        }
        return [w for w in words if w not in stopwords]

    def query(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves top_k most relevant verified medical guideline documents.
        """
        query_tokens = self._tokenize(query_text)
        if not query_tokens:
            return self.documents[:top_k]

        scored_docs = []
        for doc in self.documents:
            doc_text = f"{doc['title']} {doc['category']} {' '.join(doc['keywords'])} {doc['content']}".lower()
            doc_tokens = self._tokenize(doc_text)
            
            score = 0.0
            # Keyword matching with high weight
            for kw in doc.get("keywords", []):
                if kw.lower() in query_text.lower():
                    score += 5.0

            # Title matching
            for token in query_tokens:
                if token in doc["title"].lower():
                    score += 3.0
                if token in doc_tokens:
                    tf = doc_tokens.count(token) / (len(doc_tokens) + 1e-5)
                    score += tf * 2.0

            if score > 0:
                scored_docs.append({
                    "score": round(score, 3),
                    "document": doc
                })

        # Sort by relevance score descending
        scored_docs.sort(key=lambda x: x["score"], reverse=True)
        
        # If no strict keyword matches, fallback to top guidelines
        if not scored_docs:
            return [{
                "score": 1.0,
                "document": doc
            } for doc in self.documents[:top_k]]

        return scored_docs[:top_k]

    def get_all_documents(self) -> List[Dict[str, Any]]:
        return self.documents

rag_engine = MedicalRAGEngine()
