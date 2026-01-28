from django.db import models


# Base models sẽ được định nghĩa sau
class BaseModel(models.Model):
    """Abstract base model"""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
