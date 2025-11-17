"""Claude AI service with tool calling for real estate analysis."""
import json
from typing import List, Dict, Any, Optional
from anthropic import AsyncAnthropic

from config.settings import settings
from config.prompts import REAL_ESTATE_ANALYST_PROMPT
from services.rag_service import rag_service
from services.arcgis_client import arcgis_client


class ClaudeService:
    """Claude AI integration with real estate tools."""

    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        self.model = settings.claude_model

        # Define tools available to Claude
        self.tools = [
            {
                "name": "search_documents",
                "description": "Search uploaded documents (PDFs, market reports, appraisals) using semantic search. Use this when the user asks questions that might be answered by documents they've uploaded.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query to find relevant document chunks",
                        },
                        "max_results": {
                            "type": "integer",
                            "description": "Maximum number of results to return (default: 5)",
                            "default": 5,
                        },
                    },
                    "required": ["query"],
                },
            },
            {
                "name": "query_arcgis",
                "description": "Query ArcGIS REST API for parcel data, zoning information, or other geographic data. Use this when the user asks about property parcels, zoning, or location-specific questions.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "layer": {
                            "type": "string",
                            "description": "Layer to query: 'parcels' or 'zoning'",
                            "enum": ["parcels", "zoning"],
                        },
                        "where": {
                            "type": "string",
                            "description": "SQL WHERE clause to filter results (e.g., \"CITY = 'Austin' AND ACRES > 5\")",
                            "default": "1=1",
                        },
                        "return_geometry": {
                            "type": "boolean",
                            "description": "Whether to include geometries in response",
                            "default": True,
                        },
                        "max_records": {
                            "type": "integer",
                            "description": "Maximum number of features to return",
                            "default": 10,
                        },
                    },
                    "required": ["layer"],
                },
            },
        ]

    async def chat(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """
        Send a message to Claude with tool calling support.

        Args:
            message: User's message
            conversation_history: Previous conversation messages

        Returns:
            Dict with 'reply', 'sources', and 'metadata'
        """
        if conversation_history is None:
            conversation_history = []

        # Add user message to history
        messages = conversation_history + [{"role": "user", "content": message}]

        # Track sources for citations
        sources = []
        tool_results = []

        # Initial Claude call
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=settings.max_tokens,
            temperature=settings.temperature,
            system=REAL_ESTATE_ANALYST_PROMPT,
            messages=messages,
            tools=self.tools,
        )

        # Handle tool use (may require multiple turns)
        while response.stop_reason == "tool_use":
            # Process tool calls
            tool_use_blocks = [block for block in response.content if block.type == "tool_use"]

            for tool_use in tool_use_blocks:
                tool_name = tool_use.name
                tool_input = tool_use.input

                # Execute the tool
                tool_result = await self._execute_tool(tool_name, tool_input)
                tool_results.append({
                    "name": tool_name,
                    "input": tool_input,
                    "result": tool_result,
                })

                # Add sources if document search
                if tool_name == "search_documents" and "results" in tool_result:
                    for result in tool_result["results"]:
                        source = f"{result['document_name']}"
                        if result.get("page_number"):
                            source += f" (page {result['page_number']})"
                        sources.append(source)

            # Send tool results back to Claude
            messages.append({"role": "assistant", "content": response.content})
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": json.dumps(tool_result),
                    }
                    for tool_use in tool_use_blocks
                ],
            })

            # Get Claude's response with tool results
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=settings.max_tokens,
                temperature=settings.temperature,
                system=REAL_ESTATE_ANALYST_PROMPT,
                messages=messages,
                tools=self.tools,
            )

        # Extract final text response
        text_blocks = [block.text for block in response.content if hasattr(block, "text")]
        reply = "\n".join(text_blocks)

        return {
            "reply": reply,
            "sources": list(set(sources)),  # Deduplicate sources
            "metadata": {
                "model": self.model,
                "stop_reason": response.stop_reason,
                "tool_calls": len(tool_results),
                "tools_used": [t["name"] for t in tool_results],
            },
        }

    async def _execute_tool(self, tool_name: str, tool_input: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool call and return results."""
        try:
            if tool_name == "search_documents":
                # Search uploaded documents
                query = tool_input.get("query", "")
                max_results = tool_input.get("max_results", 5)

                search_results = await rag_service.search_documents(query, max_results)

                return {
                    "success": True,
                    "query": query,
                    "total_found": len(search_results),
                    "results": [
                        {
                            "document_name": r.document_name,
                            "content": r.content,
                            "page_number": r.page_number,
                            "relevance_score": r.relevance_score,
                        }
                        for r in search_results
                    ],
                }

            elif tool_name == "query_arcgis":
                # Query ArcGIS REST API
                layer = tool_input.get("layer", "parcels")
                where = tool_input.get("where", "1=1")
                return_geometry = tool_input.get("return_geometry", True)
                max_records = tool_input.get("max_records", 10)

                arcgis_response = await arcgis_client.query_layer(
                    layer=layer,
                    where=where,
                    return_geometry=return_geometry,
                    max_records=max_records,
                )

                return {
                    "success": True,
                    "layer": layer,
                    "total_count": arcgis_response.total_count,
                    "features": [
                        {
                            "attributes": f.attributes,
                            "geometry": f.geometry,
                        }
                        for f in arcgis_response.features
                    ],
                    "geojson": arcgis_response.geojson,
                }

            else:
                return {"success": False, "error": f"Unknown tool: {tool_name}"}

        except Exception as e:
            return {"success": False, "error": str(e)}


# Global instance
claude_service = ClaudeService()
