import math
from functools import reduce
import operator
from typing import List, Optional, Dict, Any


# ---------------------------------------------------------------------------
# Activation helpers
# ---------------------------------------------------------------------------

ACTIVATION_MAP = {
    "ReLU": "nn.ReLU()",
    "LeakyReLU": "nn.LeakyReLU()",
    "PReLU": "nn.PReLU()",
    "ELU": "nn.ELU()",
    "SELU": "nn.SELU()",
    "GELU": "nn.GELU()",
    "Sigmoid": "nn.Sigmoid()",
    "Tanh": "nn.Tanh()",
    "Softmax": "nn.Softmax(dim=-1)",
    "LogSoftmax": "nn.LogSoftmax(dim=-1)",
    "Hardswish": "nn.Hardswish()",
    "Mish": "nn.Mish()",
}


def get_activation_code(activation: str) -> str:
    return ACTIVATION_MAP.get(activation, "")


# ---------------------------------------------------------------------------
# Layer init code
# ---------------------------------------------------------------------------

def get_layer_init_code(layer) -> str:
    p = layer.params
    t = layer.type

    if t == "Linear":
        bias = p.get("bias", True)
        return f"nn.Linear({p['in_features']}, {p['out_features']}, bias={bias})"

    elif t == "Conv1d":
        return (
            f"nn.Conv1d({p['in_channels']}, {p['out_channels']}, "
            f"kernel_size={p['kernel_size']}, stride={p.get('stride', 1)}, "
            f"padding={p.get('padding', 0)})"
        )

    elif t == "Conv2d":
        return (
            f"nn.Conv2d({p['in_channels']}, {p['out_channels']}, "
            f"kernel_size={p['kernel_size']}, stride={p.get('stride', 1)}, "
            f"padding={p.get('padding', 0)})"
        )

    elif t == "LSTM":
        return (
            f"nn.LSTM({p['input_size']}, {p['hidden_size']}, "
            f"num_layers={p.get('num_layers', 1)}, batch_first=True, "
            f"dropout={p.get('dropout', 0)}, bidirectional={p.get('bidirectional', False)})"
        )

    elif t == "GRU":
        return (
            f"nn.GRU({p['input_size']}, {p['hidden_size']}, "
            f"num_layers={p.get('num_layers', 1)}, batch_first=True, "
            f"dropout={p.get('dropout', 0)}, bidirectional={p.get('bidirectional', False)})"
        )

    elif t == "RNN":
        return (
            f"nn.RNN({p['input_size']}, {p['hidden_size']}, "
            f"num_layers={p.get('num_layers', 1)}, batch_first=True, "
            f"dropout={p.get('dropout', 0)}, bidirectional={p.get('bidirectional', False)})"
        )

    elif t == "BatchNorm1d":
        return f"nn.BatchNorm1d({p['num_features']})"

    elif t == "BatchNorm2d":
        return f"nn.BatchNorm2d({p['num_features']})"

    elif t == "Dropout":
        return f"nn.Dropout(p={p.get('p', 0.5)})"

    elif t == "LayerNorm":
        ns = p.get("normalized_shape", 64)
        if isinstance(ns, list):
            return f"nn.LayerNorm({ns})"
        return f"nn.LayerNorm({ns})"

    elif t == "Embedding":
        return f"nn.Embedding({p['num_embeddings']}, {p['embedding_dim']})"

    elif t == "Flatten":
        return f"nn.Flatten(start_dim={p.get('start_dim', 1)}, end_dim={p.get('end_dim', -1)})"

    return ""


# ---------------------------------------------------------------------------
# Optimizer code
# ---------------------------------------------------------------------------

def get_optimizer_code(config) -> str:
    opt = config.optimizer
    op = config.optimizer_params

    if opt == "Adam":
        return (
            f"optim.Adam(model.parameters(), "
            f"lr={op.get('lr', 0.001)}, "
            f"betas=({op.get('beta1', 0.9)}, {op.get('beta2', 0.999)}), "
            f"weight_decay={op.get('weight_decay', 0)})"
        )
    elif opt == "AdamW":
        return (
            f"optim.AdamW(model.parameters(), "
            f"lr={op.get('lr', 0.001)}, "
            f"betas=({op.get('beta1', 0.9)}, {op.get('beta2', 0.999)}), "
            f"weight_decay={op.get('weight_decay', 0.01)})"
        )
    elif opt == "SGD":
        nesterov = op.get("nesterov", False)
        momentum = op.get("momentum", 0)
        # nesterov requires momentum > 0
        if nesterov and momentum == 0:
            nesterov = False
        return (
            f"optim.SGD(model.parameters(), "
            f"lr={op.get('lr', 0.01)}, "
            f"momentum={momentum}, "
            f"weight_decay={op.get('weight_decay', 0)}, "
            f"nesterov={nesterov})"
        )
    elif opt == "RMSprop":
        return (
            f"optim.RMSprop(model.parameters(), "
            f"lr={op.get('lr', 0.01)}, "
            f"momentum={op.get('momentum', 0)}, "
            f"weight_decay={op.get('weight_decay', 0)})"
        )
    elif opt == "Adagrad":
        return (
            f"optim.Adagrad(model.parameters(), "
            f"lr={op.get('lr', 0.01)}, "
            f"weight_decay={op.get('weight_decay', 0)})"
        )
    elif opt == "Adadelta":
        return (
            f"optim.Adadelta(model.parameters(), "
            f"lr={op.get('lr', 1.0)}, "
            f"weight_decay={op.get('weight_decay', 0)})"
        )
    elif opt == "LBFGS":
        return f"optim.LBFGS(model.parameters(), lr={op.get('lr', 1.0)})"

    return "optim.Adam(model.parameters(), lr=0.001)"


# ---------------------------------------------------------------------------
# Code generation
# ---------------------------------------------------------------------------

def generate_code(config) -> str:
    lines = []
    name = config.model_name.strip() or "MyModel"

    # Sanitize model name (replace spaces/hyphens)
    name = "".join(c if c.isalnum() or c == "_" else "_" for c in name)
    if name[0].isdigit():
        name = "Model_" + name

    lines += [
        "import torch",
        "import torch.nn as nn",
        "import torch.optim as optim",
        "",
        "",
        f"class {name}(nn.Module):",
        f"    def __init__(self):",
        f"        super({name}, self).__init__()",
    ]

    # __init__ layer definitions — use a sequential counter so numbering has no gaps
    has_attrs = False
    attr_idx = 0  # counts only layers that produce an nn.Module attribute
    # Build a mapping: config index -> attr_idx (None for Reshape)
    idx_map = {}
    for i, layer in enumerate(config.layers):
        if layer.type == "Reshape":
            idx_map[i] = None
            continue
        idx_map[i] = attr_idx
        init_code = get_layer_init_code(layer)
        if init_code:
            has_attrs = True
            lines.append(f"        self.layer_{attr_idx} = {init_code}")
        activation = layer.activation if layer.activation else "None"
        if activation and activation != "None":
            act_code = get_activation_code(activation)
            if act_code:
                has_attrs = True
                lines.append(f"        self.act_{attr_idx} = {act_code}")
        attr_idx += 1

    if not has_attrs:
        lines.append("        pass")

    lines += [
        "",
        "    def forward(self, x: torch.Tensor) -> torch.Tensor:",
    ]

    # forward pass
    if not config.layers:
        lines.append("        return x")
    else:
        for i, layer in enumerate(config.layers):
            n = idx_map[i]
            if layer.type == "Reshape":
                shape = layer.params.get("shape", [])
                shape_args = ", ".join(str(s) for s in shape)
                lines.append(f"        x = x.view(x.size(0), {shape_args})  # Reshape layer {i + 1}")
            elif layer.type in ("LSTM", "GRU", "RNN"):
                lines.append(f"        x, _ = self.layer_{n}(x)  # {layer.type} layer {i + 1}")
            else:
                lines.append(f"        x = self.layer_{n}(x)  # {layer.type} layer {i + 1}")

            activation = layer.activation if layer.activation else "None"
            if activation and activation != "None" and layer.type != "Reshape":
                act_code = get_activation_code(activation)
                if act_code:
                    lines.append(f"        x = self.act_{n}(x)  # {activation}")

        lines.append("        return x")

    lines += ["", ""]

    # Instantiation
    lines += [
        "# ── Instantiation ──────────────────────────────────────────────────",
        f"model = {name}()",
        "",
    ]

    # Optimizer
    lines += [
        "# ── Optimizer ──────────────────────────────────────────────────────",
        f"optimizer = {get_optimizer_code(config)}",
        "",
    ]

    # Loss
    loss_note = {
        "BCELoss": "  # expects sigmoid output",
        "BCEWithLogitsLoss": "  # applies sigmoid internally",
        "NLLLoss": "  # expects log-probabilities (use LogSoftmax before)",
        "KLDivLoss": "  # expects log-probabilities as input",
    }
    note = loss_note.get(config.loss_fn, "")
    lines += [
        "# ── Loss Function ──────────────────────────────────────────────────",
        f"criterion = nn.{config.loss_fn}(){note}",
        "",
    ]

    # Training loop skeleton
    lbfgs_note = config.optimizer == "LBFGS"
    lines += [
        "# ── Training Loop Skeleton ─────────────────────────────────────────",
        "# num_epochs = 10",
        "# for epoch in range(num_epochs):",
        "#     model.train()",
    ]

    if lbfgs_note:
        lines += [
            "#     def closure():",
            "#         optimizer.zero_grad()",
            "#         outputs = model(inputs)",
            "#         loss = criterion(outputs, targets)",
            "#         loss.backward()",
            "#         return loss",
            "#     optimizer.step(closure)",
        ]
    else:
        lines += [
            "#     optimizer.zero_grad()",
            "#     outputs = model(inputs)",
            "#     loss = criterion(outputs, targets)",
            "#     loss.backward()",
        ]
        if config.gradient_clip:
            lines.append(
                f"#     torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm={config.gradient_clip})"
            )
        lines += [
            "#     optimizer.step()",
        ]

    lines.append("#     print(f'Epoch {epoch + 1}, Loss: {loss.item():.4f}')")

    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Shape validation
# ---------------------------------------------------------------------------

def _conv_out(size: int, kernel: int, stride: int, padding: int) -> int:
    return math.floor((size + 2 * padding - kernel) / stride) + 1


def infer_shape(shape: List[int], layer, errors: List[str], idx: int) -> Optional[List[int]]:
    t = layer.type
    p = layer.params

    try:
        if t == "Linear":
            in_f = p.get("in_features")
            out_f = p.get("out_features")
            if shape[-1] != in_f:
                errors.append(
                    f"Layer {idx} (Linear): in_features={in_f} but input last dim is {shape[-1]}"
                )
                return None
            return list(shape[:-1]) + [out_f]

        elif t == "Conv1d":
            if len(shape) != 2:
                total = 1
                for s in shape:
                    total *= s
                hint = (
                    f" — add a Reshape layer before this one "
                    f"(e.g. Reshape to [{p.get('in_channels', 1)}, {total // max(p.get('in_channels', 1), 1)}])"
                )
                errors.append(
                    f"Layer {idx} (Conv1d): expects 2D input (C, L), got {len(shape)}D {shape}{hint}"
                )
                return None
            in_ch = p.get("in_channels")
            if shape[0] != in_ch:
                errors.append(
                    f"Layer {idx} (Conv1d): in_channels={in_ch} but input channels={shape[0]} "
                    f"— set In Channels to {shape[0]}, or add a Reshape before this layer"
                )
                return None
            out_ch = p.get("out_channels")
            k = p.get("kernel_size", 3)
            s = p.get("stride", 1)
            pad = p.get("padding", 0)
            L_out = _conv_out(shape[1], k, s, pad)
            if L_out <= 0:
                errors.append(f"Layer {idx} (Conv1d): output length {L_out} <= 0")
                return None
            return [out_ch, L_out]

        elif t == "Conv2d":
            if len(shape) != 3:
                total = 1
                for s in shape:
                    total *= s
                c = p.get("in_channels", 1)
                side = int(math.isqrt(total // c))
                hint = (
                    f" — add a Reshape layer before this one "
                    f"(e.g. Reshape to [{c}, {side}, {side}] if the spatial dims are square)"
                )
                errors.append(
                    f"Layer {idx} (Conv2d): expects 3D input (C, H, W), got {len(shape)}D {shape}{hint}"
                )
                return None
            in_ch = p.get("in_channels")
            if shape[0] != in_ch:
                errors.append(
                    f"Layer {idx} (Conv2d): in_channels={in_ch} but input channels={shape[0]} "
                    f"— set In Channels to {shape[0]}, or add a Reshape before this layer"
                )
                return None
            out_ch = p.get("out_channels")
            k = p.get("kernel_size", 3)
            s = p.get("stride", 1)
            pad = p.get("padding", 0)
            k_h = k_w = k
            s_h = s_w = s
            p_h = p_w = pad
            H_out = _conv_out(shape[1], k_h, s_h, p_h)
            W_out = _conv_out(shape[2], k_w, s_w, p_w)
            if H_out <= 0 or W_out <= 0:
                errors.append(
                    f"Layer {idx} (Conv2d): output spatial size ({H_out}, {W_out}) has non-positive dimension"
                )
                return None
            return [out_ch, H_out, W_out]

        elif t in ("LSTM", "GRU", "RNN"):
            if len(shape) != 2:
                errors.append(
                    f"Layer {idx} ({t}): expects 2D input (seq_len, input_size), got {len(shape)}D {shape}"
                )
                return None
            input_size = p.get("input_size")
            if shape[1] != input_size:
                errors.append(
                    f"Layer {idx} ({t}): input_size={input_size} but input feature dim={shape[1]}"
                )
                return None
            hidden_size = p.get("hidden_size")
            bidirectional = p.get("bidirectional", False)
            out_size = hidden_size * (2 if bidirectional else 1)
            return [shape[0], out_size]

        elif t == "BatchNorm1d":
            num_features = p.get("num_features")
            if len(shape) not in (1, 2):
                errors.append(
                    f"Layer {idx} (BatchNorm1d): expects 1D (C,) or 2D (C, L), got {len(shape)}D"
                )
                return None
            if shape[0] != num_features:
                errors.append(
                    f"Layer {idx} (BatchNorm1d): num_features={num_features} but input channels={shape[0]}"
                )
                return None
            return list(shape)

        elif t == "BatchNorm2d":
            num_features = p.get("num_features")
            if len(shape) != 3:
                errors.append(
                    f"Layer {idx} (BatchNorm2d): expects 3D input (C, H, W), got {len(shape)}D"
                )
                return None
            if shape[0] != num_features:
                errors.append(
                    f"Layer {idx} (BatchNorm2d): num_features={num_features} but input channels={shape[0]}"
                )
                return None
            return list(shape)

        elif t == "Dropout":
            return list(shape)

        elif t == "LayerNorm":
            ns = p.get("normalized_shape", 64)
            if isinstance(ns, int):
                ns_list = [ns]
            else:
                ns_list = list(ns)
            if shape[-len(ns_list):] != ns_list:
                errors.append(
                    f"Layer {idx} (LayerNorm): normalized_shape {ns_list} doesn't match "
                    f"last {len(ns_list)} dims of {shape}"
                )
                return None
            return list(shape)

        elif t == "Embedding":
            embedding_dim = p.get("embedding_dim")
            return list(shape) + [embedding_dim]

        elif t == "Flatten":
            start_dim = p.get("start_dim", 1)
            end_dim = p.get("end_dim", -1)
            # Work with full shape including fake batch=1
            full = [1] + list(shape)
            ndim = len(full)
            if end_dim < 0:
                end_dim = ndim + end_dim
            start_dim = max(start_dim, 0)
            end_dim = min(end_dim, ndim - 1)
            flat = reduce(operator.mul, full[start_dim:end_dim + 1], 1)
            new_full = list(full[:start_dim]) + [flat] + list(full[end_dim + 1:])
            return new_full[1:]  # remove fake batch dim

        elif t == "Reshape":
            target = list(p.get("shape", []))
            if not target:
                errors.append(f"Layer {idx} (Reshape): target shape is empty")
                return None
            current_total = reduce(operator.mul, shape, 1)
            target_total = reduce(operator.mul, target, 1)
            if current_total != target_total:
                errors.append(
                    f"Layer {idx} (Reshape): cannot reshape {shape} "
                    f"(total={current_total}) → {target} (total={target_total})"
                )
                return None
            return target

    except Exception as e:
        errors.append(f"Layer {idx} ({t}): shape inference error — {e}")
        return None

    return list(shape)


def validate_network(config) -> List[str]:
    errors = []

    if not config.input_shape:
        return ["Input shape must have at least one dimension."]

    for dim in config.input_shape:
        if dim <= 0:
            return [f"Input shape dimension {dim} must be > 0."]

    shape = list(config.input_shape)

    for i, layer in enumerate(config.layers):
        new_shape = infer_shape(shape, layer, errors, i)
        if new_shape is None:
            errors.append(f"  → Validation stopped at layer {i} due to the above error.")
            break
        shape = new_shape

    return errors
