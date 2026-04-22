FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port for Hugging Face Spaces
EXPOSE 7860

# Run the application with gunicorn. 
# We use 1 worker and multiple threads because the app relies on in-memory state and threads.
CMD ["gunicorn", "--workers", "1", "--threads", "10", "-b", "0.0.0.0:7860", "main:app"]
