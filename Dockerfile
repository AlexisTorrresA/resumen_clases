FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY app ./app
RUN groupadd --gid 10001 appuser && useradd --create-home --uid 10001 --gid 10001 appuser && chown -R appuser:appuser /app
USER 10001:10001
EXPOSE 8000
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000"]
