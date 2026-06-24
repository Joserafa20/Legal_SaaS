try:
    from celery import Celery
    from app.core.config import settings

    celery_app = Celery(
        "legal_saas",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL,
        include=["app.tasks.notification_tasks", "app.tasks.deadline_checker"]
    )

    celery_app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="America/Bogota",
        enable_utc=True,
        task_track_started=True,
        task_acks_late=True,
        worker_prefetch_multiplier=1,
        beat_schedule={
            "check-deadlines-every-5-minutes": {
                "task": "app.tasks.deadline_checker.check_upcoming_deadlines",
                "schedule": 300.0,
            },
            "mark-overdue-deadlines-hourly": {
                "task": "app.tasks.deadline_checker.mark_overdue_deadlines",
                "schedule": 3600.0,
            },
        },
    )
except ImportError:
    celery_app = None
