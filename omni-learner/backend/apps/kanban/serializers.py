from rest_framework import serializers
from django.utils import timezone
from .models import Board, Column, Card, Sprint, Comment, CardAttachment


class BoardListSerializer(serializers.ModelSerializer):
    """Serializer cho list boards (lighter)"""

    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    column_count = serializers.SerializerMethodField()
    card_count = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = [
            "id",
            "name",
            "description",
            "board_type",
            "is_active",
            "owner",
            "owner_email",
            "column_count",
            "card_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["owner", "created_at", "updated_at"]

    def get_column_count(self, obj):
        return obj.columns.count()

    def get_card_count(self, obj):
        return Card.objects.filter(column__board=obj).count()


class ColumnSerializer(serializers.ModelSerializer):
    """Serializer cho columns"""

    card_count = serializers.SerializerMethodField()
    is_wip_limit_reached = serializers.BooleanField(read_only=True)

    class Meta:
        model = Column
        fields = [
            "id",
            "board",
            "name",
            "position",
            "wip_limit",
            "color",
            "card_count",
            "is_wip_limit_reached",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_card_count(self, obj):
        return obj.card_count()


class CardSerializer(serializers.ModelSerializer):
    """Serializer cho cards"""

    assigned_to_email = serializers.EmailField(
        source="assigned_to.email", read_only=True
    )
    is_overdue = serializers.BooleanField(read_only=True)
    completion_percentage = serializers.FloatField(read_only=True)
    comment_count = serializers.SerializerMethodField()
    attachment_count = serializers.SerializerMethodField()

    class Meta:
        model = Card
        fields = [
            "id",
            "column",
            "title",
            "description",
            "assigned_to",
            "assigned_to_email",
            "position",
            "estimated_hours",
            "actual_hours",
            "priority",
            "status",
            "tags",
            "due_date",
            "started_at",
            "completed_at",
            "is_overdue",
            "completion_percentage",
            "comment_count",
            "attachment_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["started_at", "completed_at", "created_at", "updated_at"]

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_attachment_count(self, obj):
        return obj.attachments.count()

    def validate(self, data):
        """Custom validation"""
        # Validate estimated hours
        if "estimated_hours" in data and data["estimated_hours"] <= 0:
            raise serializers.ValidationError(
                {"estimated_hours": "Estimated hours must be greater than 0"}
            )

        # Validate due date
        if "due_date" in data and data["due_date"]:
            if data["due_date"] < timezone.now():
                raise serializers.ValidationError(
                    {"due_date": "Due date cannot be in the past"}
                )

        return data


class CardDetailSerializer(CardSerializer):
    """Detailed serializer với comments và attachments"""

    comments = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()
    column_name = serializers.CharField(source="column.name", read_only=True)
    board_name = serializers.CharField(source="column.board.name", read_only=True)

    class Meta(CardSerializer.Meta):
        fields = CardSerializer.Meta.fields + [
            "comments",
            "attachments",
            "column_name",
            "board_name",
        ]

    def get_comments(self, obj):
        comments = obj.comments.all()[:10]  # Latest 10 comments
        return CommentSerializer(comments, many=True).data

    def get_attachments(self, obj):
        attachments = obj.attachments.all()
        return CardAttachmentSerializer(attachments, many=True).data


class MoveCardSerializer(serializers.Serializer):
    """Serializer cho move card action"""

    target_column_id = serializers.IntegerField()
    position = serializers.IntegerField(required=False, default=0)

    def validate_target_column_id(self, value):
        try:
            column = Column.objects.get(id=value)

            # Check WIP limit
            if column.is_wip_limit_reached():
                raise serializers.ValidationError(
                    f"WIP limit reached for column '{column.name}' ({column.wip_limit} cards)"
                )

            return value
        except Column.DoesNotExist:
            raise serializers.ValidationError("Target column does not exist")


class BoardDetailSerializer(BoardListSerializer):
    """Detailed board serializer với columns và cards"""

    columns = serializers.SerializerMethodField()

    class Meta(BoardListSerializer.Meta):
        fields = BoardListSerializer.Meta.fields + ["columns", "default_columns"]

    def get_columns(self, obj):
        columns = obj.columns.all().prefetch_related("cards")
        return ColumnWithCardsSerializer(columns, many=True).data


class ColumnWithCardsSerializer(ColumnSerializer):
    """Column serializer kèm cards"""

    cards = CardSerializer(many=True, read_only=True)

    class Meta(ColumnSerializer.Meta):
        fields = ColumnSerializer.Meta.fields + ["cards"]


class SprintSerializer(serializers.ModelSerializer):
    """Serializer cho sprints"""

    duration_days = serializers.IntegerField(read_only=True)
    velocity = serializers.FloatField(read_only=True)
    completion_rate = serializers.FloatField(read_only=True)
    card_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Card.objects.all(),
        source="cards",
        write_only=True,
        required=False,
    )
    cards_summary = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Sprint
        fields = [
            "id",
            "board",
            "name",
            "goal",
            "start_date",
            "end_date",
            "is_active",
            "is_completed",
            "planned_hours",
            "actual_hours",
            "planned_story_points",
            "completed_story_points",
            "duration_days",
            "velocity",
            "completion_rate",
            "card_ids",
            "cards_summary",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_cards_summary(self, obj):
        total = obj.cards.count()
        completed = obj.cards.filter(completed_at__isnull=False).count()
        return {
            "total": total,
            "completed": completed,
            "in_progress": total - completed,
        }

    def validate(self, data):
        """Validate sprint dates"""
        if "start_date" in data and "end_date" in data:
            if data["end_date"] <= data["start_date"]:
                raise serializers.ValidationError(
                    {"end_date": "End date must be after start date"}
                )

        # Only one active sprint per board
        if data.get("is_active", False):
            board = data.get("board")
            active_sprints = Sprint.objects.filter(board=board, is_active=True)

            # Exclude current instance if updating
            if self.instance:
                active_sprints = active_sprints.exclude(id=self.instance.id)

            if active_sprints.exists():
                raise serializers.ValidationError(
                    {"is_active": "Only one sprint can be active per board"}
                )

        return data


class SprintDetailSerializer(SprintSerializer):
    """Detailed sprint với full card info"""

    cards = CardSerializer(many=True, read_only=True)

    class Meta(SprintSerializer.Meta):
        fields = SprintSerializer.Meta.fields + ["cards"]


class CommentSerializer(serializers.ModelSerializer):
    """Serializer cho comments"""

    author_email = serializers.EmailField(source="author.email", read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "card",
            "author",
            "author_email",
            "author_name",
            "content",
            "is_edited",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["author", "is_edited", "created_at", "updated_at"]

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.email


class CardAttachmentSerializer(serializers.ModelSerializer):
    """Serializer cho attachments"""

    uploaded_by_email = serializers.EmailField(
        source="uploaded_by.email", read_only=True
    )
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = CardAttachment
        fields = [
            "id",
            "card",
            "file",
            "filename",
            "file_size",
            "uploaded_by",
            "uploaded_by_email",
            "file_url",
            "created_at",
        ]
        read_only_fields = ["uploaded_by", "file_size", "created_at"]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and hasattr(obj.file, "url"):
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None


class BulkCardUpdateSerializer(serializers.Serializer):
    """Serializer cho bulk update cards"""

    card_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)
    updates = serializers.DictField(child=serializers.CharField(), required=True)

    def validate_updates(self, value):
        """Validate allowed fields for bulk update"""
        allowed_fields = ["status", "priority", "assigned_to", "tags"]
        invalid_fields = [k for k in value.keys() if k not in allowed_fields]

        if invalid_fields:
            raise serializers.ValidationError(
                f"Invalid fields for bulk update: {', '.join(invalid_fields)}"
            )

        return value
