# Hugging Face Model Training Configuration

## Overview
This directory contains ML training scaffolding for ScoutGPT. You can fine-tune models for various real estate tasks.

## Recommended Base Models

### 1. Zoning Text Explanation
**Task**: Explain zoning codes and regulations in plain language

**Recommended Models**:
- `mistralai/Mistral-7B-Instruct-v0.2` - Good balance of size and performance
- `meta-llama/Llama-2-7b-chat-hf` - Strong instruction following
- `Qwen/Qwen1.5-7B-Chat` - Excellent for technical text

**Dataset Structure**:
```json
{
  "input": "What does R-2 zoning mean?",
  "target": "R-2 zoning is a residential classification that allows for two-family dwellings..."
}
```

### 2. Document/OM Summarization
**Task**: Summarize offering memorandums and property documents

**Recommended Models**:
- `facebook/bart-large-cnn` - Excellent for summarization
- `google/pegasus-large` - Specialized for abstractive summarization
- `mistralai/Mistral-7B-Instruct-v0.2` - Good for long documents

**Dataset Structure**:
```json
{
  "input": "[Full offering memorandum text...]",
  "target": "This property is a 50,000 sq ft office building in downtown..."
}
```

### 3. Property Classification
**Task**: Classify properties by type, quality, or investment potential

**Recommended Models**:
- `bert-base-uncased` - Lightweight and fast
- `roberta-large` - Better accuracy for classification
- `microsoft/deberta-v3-base` - State-of-the-art for text classification

## Example HuggingFace Datasets

### Real Estate Datasets:
- `real_estate_descriptions` (custom dataset)
- `property_listings_us` (requires preprocessing)

### General Datasets for Fine-tuning:
- `squad_v2` - For Q&A tasks
- `cnn_dailymail` - For summarization
- `ag_news` - For classification

## Training Resources

### GPU Requirements:
- **7B models**: 16GB+ VRAM (A100, RTX 3090, RTX 4090)
- **3B models**: 8GB+ VRAM (RTX 3060)
- **LoRA fine-tuning**: 8GB VRAM (more accessible)

### Recommended Approach:
1. Start with **LoRA** (Low-Rank Adaptation) for efficiency
2. Use **4-bit quantization** to reduce memory usage
3. Train on small datasets first (100-1000 examples)
4. Evaluate and iterate

## Next Steps

1. Create your training dataset in JSONL format
2. Update `train_example.py` with your model and data paths
3. Run training: `python ml/train_example.py`
4. Evaluate model performance
5. Deploy to production
