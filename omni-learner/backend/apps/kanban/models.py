from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone


class TimeStampedModel(models.Model):
    """Abstract base model với timestamps"""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Board(TimeStampedModel):
    """Kanban Board"""

    BOARD_TYPES = [
        ("personal", "Personal Learning"),
        ("project", "Project-based"),
        ("sprint", "Sprint Planning"),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="boards"
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    board_type = models.CharField(
        max_length=20, choices=BOARD_TYPES, default="personal"
    )
    is_active = models.BooleanField(default=True)

    # Settings
    default_columns = models.JSONField(
        default=list,
        help_text="Default columns: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done']",
    )

    class Meta:
        db_table = "kanban_boards"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "is_active"]),
        ]

    def __str__(self):
        return f"{self.owner.email}'s {self.name}"

    def save(self, *args, **kwargs):
        # Set default columns nếu chưa có
        if not self.default_columns:
            self.default_columns = ["Backlog", "To Do", "In Progress", "Review", "Done"]
        super().save(*args, **kwargs)


class Column(TimeStampedModel):
    """Kanban Column"""

    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="columns")
    name = models.CharField(max_length=100)
    position = models.IntegerField(default=0)
    wip_limit = models.IntegerField(
        null=True, blank=True, help_text="Work In Progress limit (null = unlimited)"
    )
    color = models.CharField(
        max_length=7, default="#6B7280", help_text="Hex color code"
    )

    class Meta:
        db_table = "kanban_columns"
        ordering = ["board", "position"]
        unique_together = [["board", "name"]]
        indexes = [
            models.Index(fields=["board", "position"]),
        ]

    def __str__(self):
        return f"{self.board.name} - {self.name}"

    def card_count(self):
        """Count cards in this column"""
        return self.cards.count()

    def is_wip_limit_reached(self):
        """Check if WIP limit is reached"""
        if self.wip_limit is None:
            return False
        return self.card_count() >= self.wip_limit


class Card(TimeStampedModel):
    """Kanban Card (Task)"""

    STATUS_CHOICES = [
        ("normal", "Normal"),
        ("at_risk", "At Risk"),
        ("blocked", "Blocked"),
        ("overdue", "Overdue"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name="cards")
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_cards",
    )

    # Ordering
    position = models.IntegerField(default=0)

    # Estimates
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    # Metadata
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default="medium"
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="normal")
    tags = models.JSONField(
        default=list, blank=True, help_text="Tags: ['python', 'backend', 'urgent']"
    )

    # Dates
    due_date = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Relations (sẽ link với DeepWork sau)
    # linked_session = models.OneToOneField(
    #     'deepwork.DeepWorkSession',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='kanban_card'
    # )

    class Meta:
        db_table = "kanban_cards"
        ordering = ["column", "position"]
        indexes = [
            models.Index(fields=["column", "position"]),
            models.Index(fields=["assigned_to", "status"]),
            models.Index(fields=["due_date"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.column.name})"

    @property
    def is_overdue(self):
        """Check if card is overdue"""
        if self.due_date and not self.completed_at:
            return timezone.now() > self.due_date
        return False

    @property
    def completion_percentage(self):
        """Calculate completion percentage based on time"""
        if self.estimated_hours == 0:
            return 0
        percentage = (float(self.actual_hours) / float(self.estimated_hours)) * 100
        return min(percentage, 100)

    def move_to_column(self, target_column, position=None):
        """Move card to another column"""
        # Check WIP limit
        if target_column.is_wip_limit_reached():
            raise ValidationError(
                f"WIP limit reached for column '{target_column.name}'"
            )

        old_column = self.column
        self.column = target_column

        # Set position
        if position is not None:
            self.position = position
        else:
            # Move to end of column
            max_position = Card.objects.filter(column=target_column).aggregate(
                models.Max("position")
            )["position__max"]
            self.position = (max_position or 0) + 1

        # Auto-update timestamps
        if (
            target_column.name.lower() in ["in progress", "doing"]
            and not self.started_at
        ):
            self.started_at = timezone.now()

        if target_column.name.lower() == "done" and not self.completed_at:
            self.completed_at = timezone.now()

        self.save()
        return self


class Sprint(TimeStampedModel):
    """Sprint for Agile workflow"""

    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="sprints")
    name = models.CharField(max_length=200)
    goal = models.TextField(help_text="Sprint goal/objective")

    # Dates
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    # Status
    is_active = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)

    # Metrics
    planned_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    actual_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    planned_story_points = models.IntegerField(default=0)
    completed_story_points = models.IntegerField(default=0)

    cards = models.ManyToManyField(Card, related_name="sprints", blank=True)

    class Meta:
        db_table = "kanban_sprints"
        ordering = ["-start_date"]
        indexes = [
            models.Index(fields=["board", "is_active"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.start_date.date()} - {self.end_date.date()})"

    @property
    def duration_days(self):
        """Calculate sprint duration in days"""
        return (self.end_date - self.start_date).days

    @property
    def velocity(self):
        """Calculate velocity (completed / planned)"""
        if self.planned_story_points == 0:
            return 0
        return (self.completed_story_points / self.planned_story_points) * 100

    @property
    def completion_rate(self):
        """Calculate card completion rate"""
        total_cards = self.cards.count()
        if total_cards == 0:
            return 0
        completed_cards = self.cards.filter(completed_at__isnull=False).count()
        return (completed_cards / total_cards) * 100


class Comment(TimeStampedModel):
    """Comments on cards"""

    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="card_comments"
    )
    content = models.TextField()
    is_edited = models.BooleanField(default=False)

    class Meta:
        db_table = "kanban_comments"
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.author.email} on {self.card.title}"


class CardAttachment(TimeStampedModel):
    """File attachments for cards"""

    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="kanban/attachments/%Y/%m/")
    filename = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text="File size in bytes")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        db_table = "kanban_attachments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.filename} on {self.card.title}"
