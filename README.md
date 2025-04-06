# Predikament

**Predikament** is an AI-powered tool that helps reduce judicial delays by automatically prioritizing court cases based on urgency.

## What It Does

Predikament analyzes legal case summaries using the **Gemini API** to:

- Generate an **urgency score**
- Provide an **urgency justification**
- Sort cases in order of priority for faster and fairer judicial processing

---

## Problem Statement

Judicial systems face massive delays due to inefficient case prioritization and backlog.

---

## How Gemini API Is Used

For each case summary, Predikament sends a request to the Gemini API. The API returns:

- `urgency_score`: A numerical rating of how urgent the case is (e.g., 0–10)
- `urgency_justification`: A brief explanation for the score based on content

Cases are then sorted from highest to lowest urgency.

---

