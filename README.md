# PyTorch Neural Network Web Generator

A browser-based tool for visually designing PyTorch `nn.Module` architectures and downloading production-ready Python code.

## Features

- **Visual architecture builder** — add, reorder, and delete layers from a vertical list
- **Full layer support** — Linear, Conv1d, Conv2d, LSTM, GRU, RNN, BatchNorm1d/2d, LayerNorm, Dropout, Embedding, Flatten, Reshape
- **Per-layer activations** — ReLU, LeakyReLU, PReLU, ELU, SELU, GELU, Sigmoid, Tanh, Softmax, LogSoftmax, Hardswish, Mish
- **Shape validation** — traces tensor dimensions through every layer and reports mismatches with actionable fix suggestions
- **Training config** — loss function, optimizer (Adam, AdamW, SGD, RMSprop, Adagrad, Adadelta, LBFGS) with full parameter control, optional gradient clipping
- **Code generation** — downloads a clean, commented `.py` file with the model class, optimizer, loss, and training loop skeleton

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | FastAPI + Uvicorn |
| Code gen | Pure Python |

## Requirements

- Python 3.9+
- Node.js 18+

## Setup

**1. Install backend dependencies**

```bash
pip3 install fastapi uvicorn pydantic
```

**2. Install frontend dependencies**

```bash
cd frontend
npm install
```

## Running

From the project root:

```bash
./start.sh
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

The script starts both servers and shuts them down together on `Ctrl+C`.

## Manual start (alternative)

```bash
# Terminal 1 — backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm run dev
```

## Usage

1. Set your **model name** and **input shape** (excluding batch dimension)
   - `[128]` → tabular, `[32, 128]` → sequence, `[3, 224, 224]` → image
2. **Add layers** using the dropdown at the bottom of the Architecture panel
3. Configure each layer's parameters and activation function
4. Set the **loss function** and **optimizer** in the Training Config panel
5. Click **Validate** to check for shape mismatches across the full architecture
6. Click **Generate & Download** to download the `.py` file

## Example output

```python
class MyModel(nn.Module):
    def __init__(self):
        super(MyModel, self).__init__()
        self.layer_0 = nn.Linear(128, 64, bias=True)
        self.act_0 = nn.ReLU()
        self.layer_1 = nn.Linear(64, 10, bias=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.layer_0(x)  # Linear layer 1
        x = self.act_0(x)    # ReLU
        x = self.layer_1(x)  # Linear layer 2
        return x
```

## API endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/validate` | Validates layer shape compatibility, returns list of errors |
| `POST` | `/generate` | Generates and returns the PyTorch model code |

## License

MIT — see [LICENSE](LICENSE)
