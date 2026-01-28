from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User Admin"""

    list_display = ["email", "username", "wallet_status", "is_staff", "date_joined"]
    list_filter = ["is_staff", "is_superuser", "is_active", "date_joined"]
    search_fields = ["email", "username", "first_name", "last_name"]
    ordering = ["-date_joined"]

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "bio")}),  # Bỏ avatar
        (
            "Financial",
            {"fields": ("wallet_balance", "penalty_per_miss", "consecutive_failures")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined", "last_activity")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "username", "password1", "password2"),
            },
        ),
    )

    readonly_fields = ["last_login", "date_joined", "last_activity"]

    def wallet_status(self, obj):
        balance = obj.wallet_balance
        color = "green" if balance > 0 else "red"
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:,.0f} VND</span>',
            color,
            balance,
        )

    wallet_status.short_description = "Wallet"
