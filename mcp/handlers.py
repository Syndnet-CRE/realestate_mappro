"""
MCP Tool Handlers for ScoutGPT

These handlers can be called by Claude via MCP to interact with the ScoutGPT backend.
"""

import requests
from typing import Dict, Any, List, Optional

API_BASE_URL = "http://localhost:8000"


def list_datasets(limit: int = 100) -> List[Dict[str, Any]]:
    """List all available datasets"""
    response = requests.get(f"{API_BASE_URL}/datasets", params={"limit": limit})
    response.raise_for_status()
    return response.json()


def get_dataset_details(dataset_id: int) -> Dict[str, Any]:
    """Get detailed information about a specific dataset"""
    response = requests.get(f"{API_BASE_URL}/datasets/{dataset_id}")
    response.raise_for_status()
    return response.json()


def ingest_dataset(dataset_id: int, ingest_type: str, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Trigger ingestion of a dataset"""
    payload = {
        "ingest_type": ingest_type,
        "options": options or {}
    }
    response = requests.post(f"{API_BASE_URL}/datasets/{dataset_id}/ingest", json=payload)
    response.raise_for_status()
    return response.json()


def list_layers() -> List[Dict[str, Any]]:
    """List all available map layers"""
    response = requests.get(f"{API_BASE_URL}/layers")
    response.raise_for_status()
    return response.json()


def query_parcels(
    zoning: Optional[str] = None,
    min_lot_size: Optional[float] = None,
    bbox: Optional[str] = None,
    limit: int = 100
) -> Dict[str, Any]:
    """Query parcels with filters"""
    params = {"limit": limit}
    if zoning:
        params["zoning"] = zoning
    if min_lot_size:
        params["min_lot_size"] = min_lot_size
    if bbox:
        params["bbox"] = bbox

    response = requests.get(f"{API_BASE_URL}/parcels", params=params)
    response.raise_for_status()
    return response.json()


def get_layer_features_at_point(
    layer_name: str,
    lon: float,
    lat: float,
    buffer_meters: int = 100
) -> Dict[str, Any]:
    """Get features from a layer at a specific point"""
    # TODO: Implement point query with buffer
    # For now, just return features from the layer
    response = requests.get(f"{API_BASE_URL}/layers/{layer_name}/features")
    response.raise_for_status()
    return response.json()


def start_training(dataset_id: int, task_type: str) -> Dict[str, Any]:
    """Start a training job"""
    payload = {
        "dataset_id": dataset_id,
        "task_type": task_type
    }
    response = requests.post(f"{API_BASE_URL}/train", json=payload)
    response.raise_for_status()
    return response.json()


# Tool registry for easy lookup
TOOL_HANDLERS = {
    "list_datasets": list_datasets,
    "get_dataset_details": get_dataset_details,
    "ingest_dataset": ingest_dataset,
    "list_layers": list_layers,
    "query_parcels": query_parcels,
    "get_layer_features_at_point": get_layer_features_at_point,
    "start_training": start_training,
}


def execute_tool(tool_name: str, parameters: Dict[str, Any]) -> Any:
    """
    Execute an MCP tool by name with parameters

    Args:
        tool_name: Name of the tool to execute
        parameters: Parameters to pass to the tool

    Returns:
        Result from the tool execution
    """
    if tool_name not in TOOL_HANDLERS:
        raise ValueError(f"Unknown tool: {tool_name}")

    handler = TOOL_HANDLERS[tool_name]
    return handler(**parameters)
