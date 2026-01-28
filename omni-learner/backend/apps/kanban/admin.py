from django.contrib import admin
from django.utils.html import format_html
from .models import Board, Column, Card, Sprint, Comment, CardAttachment


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "owner",
        "board_type",
        "column_count",
        "is_active",
        "created_at",
    ]
    list_filter = ["board_type", "is_active", "created_at"]
    search_fields = ["name", "owner__email", "description"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("Basic Info", {"fields": ("owner", "name", "description", "board_type")}),
        ("Settings", {"fields": ("is_active", "default_columns")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def column_count(self, obj):
        return obj.columns.count()

    column_count.short_description = "Columns"


@admin.register(Column)
class ColumnAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "board",
        "position",
        "wip_status",
        "card_count",
        "color_preview",
    ]
    list_filter = ["board"]
    search_fields = ["name", "board__name"]
    ordering = ["board", "position"]

    def wip_status(self, obj):
        if obj.wip_limit is None:
            return "∞ (No limit)"
        count = obj.card_count()
        color = "red" if count >= obj.wip_limit else "green"
        return format_html(
            '<span style="color: {};">{} / {}</span>', color, count, obj.wip_limit
        )

    wip_status.short_description = "WIP Status"

    def color_preview(self, obj):
        return format_html(
            '<div style="width: 20px; height: 20px; background-color: {}; border: 1px solid #ccc;"></div>',
            obj.color,
        )

    color_preview.short_description = "Color"


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "column",
        "assigned_to",
        "priority_badge",
        "status_badge",
        "progress",
        "due_date",
    ]
    list_filter = ["priority", "status", "column__board", "due_date"]
    search_fields = ["title", "description", "assigned_to__email"]
    readonly_fields = ["created_at", "updated_at", "started_at", "completed_at"]

    fieldsets = (
        ("Basic Info", {"fields": ("column", "title", "description", "assigned_to")}),
        ("Estimates", {"fields": ("estimated_hours", "actual_hours", "position")}),
        ("Metadata", {"fields": ("priority", "status", "tags")}),
        ("Dates", {"fields": ("due_date", "started_at", "completed_at")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def priority_badge(self, obj):
        colors = {
            "low": "#9CA3AF",
            "medium": "#3B82F6",
            "high": "#F59E0B",
            "urgent": "#EF4444",
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold;">{}</span>',
            colors.get(obj.priority, "#000"),
            obj.get_priority_display(),
        )

    priority_badge.short_description = "Priority"

    def status_badge(self, obj):
        colors = {
            "normal": "#10B981",
            "at_risk": "#F59E0B",
            "blocked": "#EF4444",
            "overdue": "#DC2626",
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 4px;">{}</span>',
            colors.get(obj.status, "#000"),
            obj.get_status_display(),
        )

    status_badge.short_description = "Status"

    def progress(self, obj):
        percentage = obj.completion_percentage
        return format_html(
            '<div style="width: 100px; background: #E5E7EB; border-radius: 4px; overflow: hidden;">'
            '<div style="width: {}%; background: #3B82F6; height: 20px; text-align: center; color: white; font-size: 11px; line-height: 20px;">'
            "{}%</div></div>",
            percentage,
            int(percentage),
        )

    progress.short_description = "Progress"


@admin.register(Sprint)
class SprintAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "board",
        "date_range",
        "status_badge",
        "velocity_display",
        "completion_rate_display",
    ]
    list_filter = ["is_active", "is_completed", "board"]
    search_fields = ["name", "goal"]
    filter_horizontal = ["cards"]

    fieldsets = (
        ("Basic Info", {"fields": ("board", "name", "goal")}),
        ("Timeline", {"fields": ("start_date", "end_date")}),
        ("Status", {"fields": ("is_active", "is_completed")}),
        (
            "Metrics",
            {
                "fields": (
                    "planned_hours",
                    "actual_hours",
                    "planned_story_points",
                    "completed_story_points",
                )
            },
        ),
        ("Cards", {"fields": ("cards",)}),
    )

    def date_range(self, obj):
        return f"{obj.start_date.date()} → {obj.end_date.date()}"

    date_range.short_description = "Duration"

    def status_badge(self, obj):
        if obj.is_completed:
            color, text = "#10B981", "Completed"
        elif obj.is_active:
            color, text = "#3B82F6", "Active"
        else:
            color, text = "#6B7280", "Planned"

        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 4px;">{}</span>',
            color,
            text,
        )

    status_badge.short_description = "Status"

    def velocity_display(self, obj):
        velocity = obj.velocity
        color = (
            "#10B981" if velocity >= 80 else "#F59E0B" if velocity >= 50 else "#EF4444"
        )
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color,
            velocity,
        )

    velocity_display.short_description = "Velocity"

    def completion_rate_display(self, obj):
        rate = obj.completion_rate
        return format_html("<span>{:.1f}%</span>", rate)

    completion_rate_display.short_description = "Completion"


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["card", "author", "content_preview", "is_edited", "created_at"]
    list_filter = ["is_edited", "created_at"]
    search_fields = ["content", "author__email", "card__title"]
    readonly_fields = ["created_at", "updated_at"]

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    content_preview.short_description = "Content"


@admin.register(CardAttachment)
class CardAttachmentAdmin(admin.ModelAdmin):
    list_display = [
        "filename",
        "card",
        "file_size_display",
        "uploaded_by",
        "created_at",
    ]
    list_filter = ["created_at"]
    search_fields = ["filename", "card__title"]
    readonly_fields = ["file_size", "created_at", "updated_at"]

    def file_size_display(self, obj):
        size_kb = obj.file_size / 1024
        if size_kb < 1024:
            return f"{size_kb:.1f} KB"
        return f"{size_kb/1024:.1f} MB"

    file_size_display.short_description = "Size"
