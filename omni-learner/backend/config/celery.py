import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

app = Celery("omnilearner")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# Scheduled tasks
app.conf.beat_schedule = {
    "run-daily-punishment-midnight": {
        "task": "apps.wallet.tasks.run_daily_punishment_check",
        "schedule": crontab(hour=0, minute=0),  # 00:00 mỗi ngày
    },
    "calculate-daily-metrics": {
        "task": "apps.analytics.tasks.calculate_daily_metrics",
        "schedule": crontab(hour=23, minute=55),  # 23:55 mỗi ngày
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
