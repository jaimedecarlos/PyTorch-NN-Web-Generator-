from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from generator import generate_code, validate_network

app = FastAPI(title="PyTorch Network Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LayerConfig(BaseModel):
    id: str
    type: str
    params: Dict[str, Any]
    activation: Optional[str] = "None"


class NetworkConfig(BaseModel):
    model_name: str
    input_shape: List[int]
    layers: List[LayerConfig]
    loss_fn: str
    optimizer: str
    optimizer_params: Dict[str, Any]
    gradient_clip: Optional[float] = None


@app.post("/generate")
def generate(config: NetworkConfig):
    code = generate_code(config)
    return {"code": code}


@app.post("/validate")
def validate(config: NetworkConfig):
    errors = validate_network(config)
    return {"errors": errors}


@app.get("/health")
def health():
    return {"status": "ok"}
