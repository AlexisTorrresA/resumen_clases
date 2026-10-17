from __future__ import annotations

import json
import os
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/ai", tags=["ai-study"])

OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"


def _api_key() -> str:
    return os.getenv("OPENAI_API_KEY", "").strip()


def _model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-5.6-sol").strip() or "gpt-5.6-sol"


class OpenAnswerGradeRequest(BaseModel):
    subject_id: str = Field(min_length=1, max_length=40)
    subject_title: str = Field(default="", max_length=240)
    question: str = Field(min_length=3, max_length=4000)
    user_answer: str = Field(min_length=1, max_length=8000)
    reference_answer: str = Field(default="", max_length=8000)
    explanation: str = Field(default="", max_length=6000)
    keywords: list[str] = Field(default_factory=list, max_length=40)


def _extract_output_text(data: dict[str, Any]) -> str:
    for output in data.get("output", []):
        if output.get("type") != "message":
            continue
        for content in output.get("content", []):
            if content.get("type") == "output_text" and content.get("text"):
                return str(content["text"])
            if content.get("type") == "refusal":
                raise HTTPException(status_code=422, detail="La IA no pudo evaluar esta respuesta")
    raise HTTPException(status_code=502, detail="La IA no devolvió una evaluación utilizable")


@router.get("/status")
def ai_status():
    return {"enabled": bool(_api_key()), "model": _model() if _api_key() else None}


@router.post("/grade-open")
def grade_open_answer(item: OpenAnswerGradeRequest):
    api_key = _api_key()
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY no está configurada en el servidor Y700",
        )

    schema = {
        "type": "object",
        "properties": {
            "score": {"type": "number", "minimum": 0, "maximum": 1},
            "verdict": {
                "type": "string",
                "enum": ["correcta", "parcial", "incorrecta"],
            },
            "feedback": {"type": "string"},
            "strengths": {"type": "array", "items": {"type": "string"}},
            "missing": {"type": "array", "items": {"type": "string"}},
            "improved_answer": {"type": "string"},
            "explanation": {"type": "string"},
        },
        "required": [
            "score",
            "verdict",
            "feedback",
            "strengths",
            "missing",
            "improved_answer",
            "explanation",
        ],
        "additionalProperties": False,
    }

    instructions = (
        "Eres un profesor del Máster en Inteligencia Artificial que corrige respuestas de examen. "
        "Evalúa por comprensión conceptual, no por coincidencia literal. Acepta sinónimos, "
        "formulaciones equivalentes y respuestas breves si contienen lo esencial. Penaliza errores "
        "conceptuales, contradicciones y omisiones importantes. No exijas información que la pregunta "
        "no pide. La puntuación va de 0 a 1: 1 significa respuesta plenamente correcta; 0.7-0.99, "
        "correcta con detalles menores; 0.4-0.69, parcialmente correcta; menos de 0.4, insuficiente. "
        "Da una explicación pedagógica corta, concreta y útil para estudiar. Responde en español."
    )

    keyword_text = ", ".join(item.keywords[:40]) if item.keywords else "(sin lista específica)"
    user_input = (
        f"ASIGNATURA: {item.subject_title or item.subject_id}\n"
        f"PREGUNTA: {item.question}\n\n"
        f"RESPUESTA DEL ESTUDIANTE:\n{item.user_answer}\n\n"
        f"RESPUESTA DE REFERENCIA:\n{item.reference_answer or '(no disponible)'}\n\n"
        f"EXPLICACIÓN DE APOYO:\n{item.explanation or '(no disponible)'}\n\n"
        f"CONCEPTOS CLAVE ESPERADOS: {keyword_text}\n\n"
        "Corrige la respuesta y explica qué está bien, qué falta y cómo sería una respuesta mejor."
    )

    try:
        response = httpx.post(
            OPENAI_RESPONSES_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": _model(),
                "store": False,
                "max_output_tokens": 1200,
                "input": [
                    {"role": "system", "content": instructions},
                    {"role": "user", "content": user_input},
                ],
                "text": {
                    "format": {
                        "type": "json_schema",
                        "name": "study_open_answer_grade",
                        "strict": True,
                        "schema": schema,
                    }
                },
            },
            timeout=45.0,
        )
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="La IA tardó demasiado en responder") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="No se pudo conectar con el servicio de IA") from exc

    if response.status_code >= 400:
        detail = "El servicio de IA rechazó la solicitud"
        try:
            body = response.json()
            detail = body.get("error", {}).get("message") or detail
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=detail)

    raw = _extract_output_text(response.json())
    try:
        result = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail="La IA devolvió un formato inesperado") from exc

    score = max(0.0, min(1.0, float(result.get("score", 0))))
    result["score"] = round(score, 3)
    result["model"] = _model()
    result["ai"] = True
    return result
