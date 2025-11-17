"""RAG (Retrieval-Augmented Generation) service for document search."""
import asyncio
from typing import List, Dict, Any, Optional
import numpy as np
from openai import AsyncOpenAI

from models.database import SessionLocal, DocumentChunkModel, DocumentModel
from models.schemas import DocumentSearchResult
from config.settings import settings


class RAGService:
    """Document embedding and semantic search service."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.embedding_model = settings.embedding_model

    async def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for text chunks using OpenAI."""
        if not settings.openai_api_key:
            # Return dummy embeddings if no API key
            return [[0.0] * 1536 for _ in texts]

        try:
            response = await self.client.embeddings.create(
                model=self.embedding_model,
                input=texts,
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            print(f"Embedding error: {e}")
            return [[0.0] * 1536 for _ in texts]

    async def store_document_chunks(
        self,
        document_id: str,
        document_name: str,
        chunks: List[Dict[str, Any]],
    ):
        """Store document chunks with embeddings in database."""
        db = SessionLocal()
        try:
            # Extract text content for embedding
            texts = [chunk["content"] for chunk in chunks]

            # Generate embeddings
            embeddings = await self.create_embeddings(texts)

            # Store chunks with embeddings
            for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                db_chunk = DocumentChunkModel(
                    document_id=document_id,
                    document_name=document_name,
                    content=chunk["content"],
                    page_number=chunk.get("page_number"),
                    chunk_index=chunk.get("chunk_index", idx),
                    embedding=embedding,  # Store as JSON
                    metadata=chunk.get("metadata", {}),
                )
                db.add(db_chunk)

            db.commit()
        finally:
            db.close()

    async def search_documents(
        self,
        query: str,
        max_results: int = 5,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[DocumentSearchResult]:
        """Search documents using semantic similarity."""
        # Generate query embedding
        query_embeddings = await self.create_embeddings([query])
        query_embedding = query_embeddings[0]

        db = SessionLocal()
        try:
            # Get all chunks (in production, use vector database like Pinecone/Weaviate)
            query_obj = db.query(DocumentChunkModel)

            # Apply filters if provided
            if filters:
                if "document_id" in filters:
                    query_obj = query_obj.filter(DocumentChunkModel.document_id == filters["document_id"])
                if "document_name" in filters:
                    query_obj = query_obj.filter(DocumentChunkModel.document_name.contains(filters["document_name"]))

            chunks = query_obj.all()

            # Compute cosine similarity
            results = []
            for chunk in chunks:
                if chunk.embedding:
                    similarity = self._cosine_similarity(query_embedding, chunk.embedding)
                    results.append({
                        "chunk": chunk,
                        "score": similarity,
                    })

            # Sort by similarity and take top results
            results.sort(key=lambda x: x["score"], reverse=True)
            top_results = results[:max_results]

            # Convert to response format
            search_results = []
            for item in top_results:
                chunk = item["chunk"]
                search_results.append(
                    DocumentSearchResult(
                        document_name=chunk.document_name,
                        content=chunk.content,
                        page_number=chunk.page_number,
                        relevance_score=float(item["score"]),
                        metadata=chunk.meta_data or {},
                    )
                )

            return search_results

        finally:
            db.close()

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)

        if vec1.size == 0 or vec2.size == 0:
            return 0.0

        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return float(dot_product / (norm1 * norm2))

    async def get_context_for_query(self, query: str, max_chunks: int = 5) -> str:
        """Get relevant document context for a query (for Claude)."""
        results = await self.search_documents(query, max_results=max_chunks)

        if not results:
            return ""

        # Format context with citations
        context_parts = []
        for idx, result in enumerate(results, start=1):
            page_info = f" (page {result.page_number})" if result.page_number else ""
            context_parts.append(
                f"[Source {idx}: {result.document_name}{page_info}]\n{result.content}\n"
            )

        return "\n---\n".join(context_parts)


# Global instance
rag_service = RAGService()
