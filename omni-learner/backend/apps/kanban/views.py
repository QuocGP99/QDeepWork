from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db import models
from django.utils import timezone

from .models import Board, Column, Card, Sprint, Comment, CardAttachment
from .serializers import (
    BoardListSerializer,
    BoardDetailSerializer,
    ColumnSerializer,
    CardSerializer,
    CardDetailSerializer,
    MoveCardSerializer,
    SprintSerializer,
    SprintDetailSerializer,
    CommentSerializer,
    CardAttachmentSerializer,
    BulkCardUpdateSerializer,
    ColumnWithCardsSerializer,
)


class BoardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Boards

    list: Get all boards for current user
    create: Create new board
    retrieve: Get board detail with columns and cards
    update: Update board
    destroy: Delete board
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
        DjangoFilterBackend,
    ]
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "updated_at", "name"]
    filterset_fields = ["board_type", "is_active"]

    def get_queryset(self):
        """Only show user's own boards"""
        return Board.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return BoardDetailSerializer
        return BoardListSerializer

    def perform_create(self, serializer):
        """Set owner to current user"""
        board = serializer.save(owner=self.request.user)

        # Auto-create default columns
        default_columns = [
            {"name": "Backlog", "position": 0, "color": "#9CA3AF"},
            {"name": "To Do", "position": 1, "color": "#3B82F6"},
            {"name": "In Progress", "position": 2, "color": "#F59E0B", "wip_limit": 3},
            {"name": "Review", "position": 3, "color": "#8B5CF6"},
            {"name": "Done", "position": 4, "color": "#10B981"},
        ]

        for col_data in default_columns:
            Column.objects.create(board=board, **col_data)

    @action(detail=True, methods=["post"])
    def duplicate(self, request, pk=None):
        """Duplicate a board with its columns (without cards)"""
        board = self.get_object()

        with transaction.atomic():
            # Duplicate board
            new_board = Board.objects.create(
                owner=request.user,
                name=f"{board.name} (Copy)",
                description=board.description,
                board_type=board.board_type,
                default_columns=board.default_columns,
            )

            # Duplicate columns
            for column in board.columns.all():
                Column.objects.create(
                    board=new_board,
                    name=column.name,
                    position=column.position,
                    wip_limit=column.wip_limit,
                    color=column.color,
                )

        serializer = self.get_serializer(new_board)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def statistics(self, request, pk=None):
        """Get board statistics"""
        board = self.get_object()
        cards = Card.objects.filter(column__board=board)

        stats = {
            "total_cards": cards.count(),
            "completed_cards": cards.filter(completed_at__isnull=False).count(),
            "in_progress_cards": cards.filter(
                started_at__isnull=False, completed_at__isnull=True
            ).count(),
            "overdue_cards": cards.filter(
                due_date__lt=timezone.now(), completed_at__isnull=True
            ).count(),
            "total_estimated_hours": float(
                cards.aggregate(total=models.Sum("estimated_hours"))["total"] or 0
            ),
            "total_actual_hours": float(
                cards.aggregate(total=models.Sum("actual_hours"))["total"] or 0
            ),
            "cards_by_priority": {
                priority: cards.filter(priority=priority).count()
                for priority, _ in Card.PRIORITY_CHOICES
            },
            "cards_by_status": {
                status: cards.filter(status=status).count()
                for status, _ in Card.STATUS_CHOICES
            },
        }

        return Response(stats)


class ColumnViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Columns

    list: Get all columns (filtered by board)
    create: Create new column
    update: Update column
    destroy: Delete column
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ColumnSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["board"]
    ordering_fields = ["position"]
    ordering = ["position"]

    def get_queryset(self):
        """Only show columns from user's boards"""
        return Column.objects.filter(board__owner=self.request.user)

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """Reorder columns

        Payload: { "board_id": 1, "column_orders": [{"id": 1, "position": 0}, ...] }
        """
        board_id = request.data.get("board_id")
        column_orders = request.data.get("column_orders", [])

        board = get_object_or_404(Board, id=board_id, owner=request.user)

        with transaction.atomic():
            for item in column_orders:
                Column.objects.filter(id=item["id"], board=board).update(
                    position=item["position"]
                )

        columns = Column.objects.filter(board=board).order_by("position")
        serializer = self.get_serializer(columns, many=True)
        return Response(serializer.data)


class CardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Cards

    Supports filtering, searching, and custom actions
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
        DjangoFilterBackend,
    ]
    search_fields = ["title", "description", "tags"]
    ordering_fields = ["position", "created_at", "due_date", "priority"]
    filterset_fields = ["column", "assigned_to", "priority", "status"]

    def get_queryset(self):
        """Only show cards from user's boards"""
        queryset = Card.objects.filter(column__board__owner=self.request.user)

        # Filter by board
        board_id = self.request.query_params.get("board_id")
        if board_id:
            queryset = queryset.filter(column__board_id=board_id)

        # Filter overdue cards
        if self.request.query_params.get("overdue") == "true":
            queryset = queryset.filter(
                due_date__lt=timezone.now(), completed_at__isnull=True
            )

        return queryset.select_related("column", "assigned_to")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CardDetailSerializer
        return CardSerializer

    @action(detail=True, methods=["post"])
    def move(self, request, pk=None):
        """Move card to another column

        Payload: { "target_column_id": 2, "position": 0 }
        """
        card = self.get_object()
        serializer = MoveCardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_column = get_object_or_404(
            Column, id=serializer.validated_data["target_column_id"]
        )

        with transaction.atomic():
            card.move_to_column(
                target_column, position=serializer.validated_data.get("position")
            )

        return Response(CardDetailSerializer(card).data)

    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        """Start working on a card"""
        card = self.get_object()

        if card.started_at:
            return Response(
                {"error": "Card already started"}, status=status.HTTP_400_BAD_REQUEST
            )

        card.started_at = timezone.now()
        card.status = "normal"
        card.save()

        return Response(CardDetailSerializer(card).data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """Mark card as completed"""
        card = self.get_object()

        if card.completed_at:
            return Response(
                {"error": "Card already completed"}, status=status.HTTP_400_BAD_REQUEST
            )

        card.completed_at = timezone.now()
        card.status = "normal"
        card.save()

        return Response(CardDetailSerializer(card).data)

    @action(detail=False, methods=["post"])
    def bulk_update(self, request):
        """Bulk update multiple cards

        Payload: {
            "card_ids": [1, 2, 3],
            "updates": {"status": "at_risk", "priority": "high"}
        }
        """
        serializer = BulkCardUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        card_ids = serializer.validated_data["card_ids"]
        updates = serializer.validated_data["updates"]

        cards = Card.objects.filter(id__in=card_ids, column__board__owner=request.user)

        updated_count = cards.update(**updates)

        return Response(
            {
                "updated_count": updated_count,
                "cards": CardSerializer(cards, many=True).data,
            }
        )


class SprintViewSet(viewsets.ModelViewSet):
    """ViewSet for Sprints"""

    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["board", "is_active", "is_completed"]
    ordering_fields = ["start_date", "end_date"]
    ordering = ["-start_date"]

    def get_queryset(self):
        return Sprint.objects.filter(board__owner=self.request.user)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return SprintDetailSerializer
        return SprintSerializer

    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        """Start a sprint"""
        sprint = self.get_object()

        if sprint.is_active:
            return Response(
                {"error": "Sprint already started"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Deactivate other sprints
        Sprint.objects.filter(board=sprint.board, is_active=True).update(
            is_active=False
        )

        sprint.is_active = True
        sprint.save()

        return Response(SprintDetailSerializer(sprint).data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """Complete a sprint"""
        sprint = self.get_object()

        sprint.is_active = False
        sprint.is_completed = True
        sprint.save()

        return Response(SprintDetailSerializer(sprint).data)


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for Comments"""

    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["card"]

    def get_queryset(self):
        return Comment.objects.filter(
            card__column__board__owner=self.request.user
        ).select_related("author", "card")

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class CardAttachmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Card Attachments"""

    permission_classes = [IsAuthenticated]
    serializer_class = CardAttachmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["card"]

    def get_queryset(self):
        return CardAttachment.objects.filter(
            card__column__board__owner=self.request.user
        )

    def perform_create(self, serializer):
        file = self.request.FILES.get("file")
        serializer.save(
            uploaded_by=self.request.user, filename=file.name, file_size=file.size
        )
