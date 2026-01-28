from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model với Wallet tích hợp"""

    # Override email để unique và required
    email = models.EmailField("Email address", unique=True)

    # Financial Commitment Fields
    wallet_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text="Số dư ví hiện tại (VND)",
    )
    penalty_per_miss = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=50000.00,
        help_text="Mức phạt cho mỗi lần bỏ học (VND)",
    )
    consecutive_failures = models.IntegerField(
        default=0, help_text="Số lần thất bại liên tiếp"
    )

    # Profile fields
    bio = models.TextField(blank=True, help_text="Giới thiệu bản thân")
    # avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)  # BỎ TẠM

    # Tracking
    last_activity = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-date_joined"]

    def __str__(self):
        return self.email

    def get_full_name(self):
        full_name = super().get_full_name()
        return full_name if full_name else self.email
