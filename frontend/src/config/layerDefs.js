export const LAYER_DEFS = {
  Linear: {
    label: "Linear",
    category: "core",
    params: {
      in_features:  { type: "number",  default: 128,  label: "In Features",  min: 1 },
      out_features: { type: "number",  default: 64,   label: "Out Features", min: 1 },
      bias:         { type: "boolean", default: true,  label: "Bias" },
    },
  },
  Conv1d: {
    label: "Conv1d",
    category: "conv",
    params: {
      in_channels:  { type: "number", default: 1,  label: "In Channels",  min: 1 },
      out_channels: { type: "number", default: 32, label: "Out Channels", min: 1 },
      kernel_size:  { type: "number", default: 3,  label: "Kernel Size",  min: 1 },
      stride:       { type: "number", default: 1,  label: "Stride",       min: 1 },
      padding:      { type: "number", default: 0,  label: "Padding",      min: 0 },
    },
  },
  Conv2d: {
    label: "Conv2d",
    category: "conv",
    params: {
      in_channels:  { type: "number", default: 3,  label: "In Channels",  min: 1 },
      out_channels: { type: "number", default: 32, label: "Out Channels", min: 1 },
      kernel_size:  { type: "number", default: 3,  label: "Kernel Size",  min: 1 },
      stride:       { type: "number", default: 1,  label: "Stride",       min: 1 },
      padding:      { type: "number", default: 0,  label: "Padding",      min: 0 },
    },
  },
  LSTM: {
    label: "LSTM",
    category: "recurrent",
    params: {
      input_size:    { type: "number",  default: 128,   label: "Input Size",    min: 1 },
      hidden_size:   { type: "number",  default: 256,   label: "Hidden Size",   min: 1 },
      num_layers:    { type: "number",  default: 1,     label: "Num Layers",    min: 1 },
      dropout:       { type: "float",   default: 0,     label: "Dropout",       min: 0, max: 1, step: 0.05 },
      bidirectional: { type: "boolean", default: false, label: "Bidirectional" },
    },
  },
  GRU: {
    label: "GRU",
    category: "recurrent",
    params: {
      input_size:    { type: "number",  default: 128,   label: "Input Size",    min: 1 },
      hidden_size:   { type: "number",  default: 256,   label: "Hidden Size",   min: 1 },
      num_layers:    { type: "number",  default: 1,     label: "Num Layers",    min: 1 },
      dropout:       { type: "float",   default: 0,     label: "Dropout",       min: 0, max: 1, step: 0.05 },
      bidirectional: { type: "boolean", default: false, label: "Bidirectional" },
    },
  },
  RNN: {
    label: "RNN",
    category: "recurrent",
    params: {
      input_size:    { type: "number",  default: 128,   label: "Input Size",    min: 1 },
      hidden_size:   { type: "number",  default: 256,   label: "Hidden Size",   min: 1 },
      num_layers:    { type: "number",  default: 1,     label: "Num Layers",    min: 1 },
      dropout:       { type: "float",   default: 0,     label: "Dropout",       min: 0, max: 1, step: 0.05 },
      bidirectional: { type: "boolean", default: false, label: "Bidirectional" },
    },
  },
  BatchNorm1d: {
    label: "BatchNorm1d",
    category: "norm",
    params: {
      num_features: { type: "number", default: 64, label: "Num Features", min: 1 },
    },
  },
  BatchNorm2d: {
    label: "BatchNorm2d",
    category: "norm",
    params: {
      num_features: { type: "number", default: 32, label: "Num Features", min: 1 },
    },
  },
  LayerNorm: {
    label: "LayerNorm",
    category: "norm",
    params: {
      normalized_shape: { type: "number", default: 64, label: "Normalized Shape", min: 1 },
    },
  },
  Dropout: {
    label: "Dropout",
    category: "regularize",
    params: {
      p: { type: "float", default: 0.5, label: "Probability", min: 0, max: 1, step: 0.05 },
    },
  },
  Embedding: {
    label: "Embedding",
    category: "core",
    params: {
      num_embeddings: { type: "number", default: 1000, label: "Num Embeddings", min: 1 },
      embedding_dim:  { type: "number", default: 64,   label: "Embedding Dim",  min: 1 },
    },
  },
  Flatten: {
    label: "Flatten",
    category: "reshape",
    params: {
      start_dim: { type: "number", default: 1,  label: "Start Dim" },
      end_dim:   { type: "number", default: -1, label: "End Dim" },
    },
  },
  Reshape: {
    label: "Reshape",
    category: "reshape",
    noActivation: true,
    params: {
      shape: { type: "shape", default: [64], label: "Target Shape (comma-separated)" },
    },
  },
}

export const LAYER_CATEGORIES = {
  core:       { label: "Core",       color: "#3b82f6" },
  conv:       { label: "Conv",       color: "#8b5cf6" },
  recurrent:  { label: "Recurrent",  color: "#f59e0b" },
  norm:       { label: "Norm",       color: "#10b981" },
  regularize: { label: "Regularize", color: "#ef4444" },
  reshape:    { label: "Reshape",    color: "#6b7280" },
}

export const ACTIVATIONS = [
  "None",
  "ReLU",
  "LeakyReLU",
  "PReLU",
  "ELU",
  "SELU",
  "GELU",
  "Sigmoid",
  "Tanh",
  "Softmax",
  "LogSoftmax",
  "Hardswish",
  "Mish",
]

export const LOSS_FUNCTIONS = [
  "CrossEntropyLoss",
  "NLLLoss",
  "BCELoss",
  "BCEWithLogitsLoss",
  "MSELoss",
  "L1Loss",
  "SmoothL1Loss",
  "HuberLoss",
  "KLDivLoss",
  "MultiMarginLoss",
  "TripletMarginLoss",
]

export const OPTIMIZER_DEFS = {
  Adam: {
    lr:           { type: "float", default: 0.001,  label: "Learning Rate",  step: 0.0001, min: 0 },
    beta1:        { type: "float", default: 0.9,    label: "Beta 1",         step: 0.01,   min: 0, max: 1 },
    beta2:        { type: "float", default: 0.999,  label: "Beta 2",         step: 0.001,  min: 0, max: 1 },
    weight_decay: { type: "float", default: 0,      label: "Weight Decay",   step: 0.0001, min: 0 },
  },
  AdamW: {
    lr:           { type: "float", default: 0.001,  label: "Learning Rate",  step: 0.0001, min: 0 },
    beta1:        { type: "float", default: 0.9,    label: "Beta 1",         step: 0.01,   min: 0, max: 1 },
    beta2:        { type: "float", default: 0.999,  label: "Beta 2",         step: 0.001,  min: 0, max: 1 },
    weight_decay: { type: "float", default: 0.01,   label: "Weight Decay",   step: 0.0001, min: 0 },
  },
  SGD: {
    lr:           { type: "float",   default: 0.01,  label: "Learning Rate", step: 0.001, min: 0 },
    momentum:     { type: "float",   default: 0,     label: "Momentum",      step: 0.01,  min: 0, max: 1 },
    weight_decay: { type: "float",   default: 0,     label: "Weight Decay",  step: 0.0001, min: 0 },
    nesterov:     { type: "boolean", default: false, label: "Nesterov" },
  },
  RMSprop: {
    lr:           { type: "float", default: 0.01, label: "Learning Rate", step: 0.001,  min: 0 },
    momentum:     { type: "float", default: 0,    label: "Momentum",      step: 0.01,   min: 0, max: 1 },
    weight_decay: { type: "float", default: 0,    label: "Weight Decay",  step: 0.0001, min: 0 },
  },
  Adagrad: {
    lr:           { type: "float", default: 0.01, label: "Learning Rate", step: 0.001,  min: 0 },
    weight_decay: { type: "float", default: 0,    label: "Weight Decay",  step: 0.0001, min: 0 },
  },
  Adadelta: {
    lr:           { type: "float", default: 1.0,  label: "Learning Rate", step: 0.01,   min: 0 },
    weight_decay: { type: "float", default: 0,    label: "Weight Decay",  step: 0.0001, min: 0 },
  },
  LBFGS: {
    lr: { type: "float", default: 1.0, label: "Learning Rate", step: 0.01, min: 0 },
  },
}
