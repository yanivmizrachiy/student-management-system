from django.contrib.auth.models import User
from .models import AuditTrail


def is_manager(user):
    """בודק אם המשתמש הוא מנהל (superuser)"""
    return user.is_authenticated and user.is_superuser


def log_change(entity, entity_id, field, old_value, new_value, user):
    """יוצר רשומת Audit Trail"""
    AuditTrail.objects.create(
        entity=entity,
        entity_id=entity_id,
        field=field,
        old_value=str(old_value) if old_value else '',
        new_value=str(new_value) if new_value else '',
        user=user.username if user.is_authenticated else 'Anonymous',
    )

