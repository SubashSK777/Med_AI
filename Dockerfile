FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir || true
RUN pip install flask requests gunicorn
COPY . .
EXPOSE 7860
ENV FLASK_APP=app.py
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]
