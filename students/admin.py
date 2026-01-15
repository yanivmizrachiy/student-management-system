from django.contrib import admin
from .models import Grade, Group, Student, Assessment, Attendance, AuditTrail


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_student_count', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at']


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'grade', 'teacher', 'get_student_count', 'created_at']
    list_filter = ['grade', 'created_at']
    search_fields = ['name', 'teacher']
    readonly_fields = ['created_at']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'id_number', 'grade', 'group', 'phone', 'created_at']
    list_filter = ['grade', 'group', 'created_at']
    search_fields = ['first_name', 'last_name', 'id_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('פרטים אישיים', {
            'fields': ('first_name', 'last_name', 'id_number', 'birth_date', 'profile_image')
        }),
        ('פרטי קשר', {
            'fields': ('phone', 'address')
        }),
        ('פרטי לימודים', {
            'fields': ('grade', 'group', 'notes', 'created_at', 'updated_at')
        }),
    )


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'metric', 'value', 'date', 'created_at']
    list_filter = ['metric', 'date', 'created_at']
    search_fields = ['student__first_name', 'student__last_name']
    readonly_fields = ['created_at']
    date_hierarchy = 'date'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'date', 'status', 'created_at']
    list_filter = ['status', 'date', 'created_at']
    search_fields = ['student__first_name', 'student__last_name']
    readonly_fields = ['created_at']
    date_hierarchy = 'date'


@admin.register(AuditTrail)
class AuditTrailAdmin(admin.ModelAdmin):
    list_display = ['entity', 'entity_id', 'field', 'user', 'timestamp']
    list_filter = ['entity', 'user', 'timestamp']
    search_fields = ['entity', 'field', 'user']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
