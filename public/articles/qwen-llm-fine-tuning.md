---
{
  "id": 13,
  "slug": "qwen-llm-fine-tuning",
  "title": "Qwen LLM Fine Tuning",
  "subtitle": "LoRA and PEFT adaptation of Qwen models on an eBay car dataset for structured domain responses.",
  "date": "Mar 2025",
  "readTime": "7 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "ML Engineer",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {},
  "heroImage": "/assets/images/eBay.png",
  "heroCaption": "Figure 1: Domain-specific fine-tuning for automotive listing understanding."
}
---

## Introduction

General-purpose LLMs are strong out of the box, but real-world products often demand domain-specific accuracy and structured outputs. This project focuses on fine-tuning Qwen models using LoRA and PEFT on an eBay car dataset to improve reliability for automotive listing tasks.

## Background and Motivation

Car listings contain noisy, inconsistent text that mixes specifications, seller notes, and pricing details. Extracting structured data from this format is challenging, especially when the model is expected to return normalized fields such as year, make, model, trim, and mileage. Fine-tuning allows the model to internalize domain conventions and reduce ambiguity.

## System Overview

The training pipeline uses parameter-efficient adapters to minimize GPU memory usage while preserving base model capability. Data is standardized into prompt and response templates that encourage consistent formatting. The work leverages remote lab GPUs for training and evaluation at scale.

## Our Work

I prepared the dataset, designed prompt formats for extraction and summarization, and configured LoRA and PEFT training runs. I also built evaluation scripts to compare model outputs against structured ground truth and inspected error patterns to guide iterative refinement.

## Results and Impact

The fine-tuned model produced more consistent, structured outputs and reduced common failure modes seen in the base model, such as missing fields and inconsistent formatting. This approach demonstrates how small, efficient adapters can meaningfully improve domain performance without retraining full model weights.

## Future Work

Planned extensions include expanding the dataset to cover more vehicle categories, adding tool-augmented validation for numeric fields, and exploring smaller edge-friendly variants for deployment in constrained environments.
