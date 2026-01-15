from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import User


class Grade(models.Model):
    """מודל שכבה"""
    name = models.CharField(max_length=10, unique=True, verbose_name='שם שכבה')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='תאריך יצירה')
    
    class Meta:
        verbose_name = 'שכבה'
        verbose_name_plural = 'שכבות'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def get_student_count(self):
        """מחזיר מספר תלמידים בשכבה"""
        return Student.objects.filter(grade=self).count()


class Group(models.Model):
    """מודל הקבצה"""
    name = models.CharField(max_length=20, verbose_name='שם הקבצה')
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, verbose_name='שכבה')
    teacher = models.CharField(max_length=50, verbose_name='שם מורה')
    description = models.TextField(blank=True, null=True, verbose_name='תיאור')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='תאריך יצירה')
    
    class Meta:
        verbose_name = 'הקבצה'
        verbose_name_plural = 'הקבצות'
        ordering = ['grade', 'name']
        unique_together = ['name', 'grade']
    
    def __str__(self):
        return f"{self.name} - {self.grade.name}"
    
    def get_student_count(self):
        """מחזיר מספר תלמידים בהקבצה"""
        return Student.objects.filter(group=self).count()


class Student(models.Model):
    """מודל תלמיד"""
    first_name = models.CharField(max_length=30, verbose_name='שם פרטי')
    last_name = models.CharField(max_length=30, verbose_name='שם משפחה')
    id_number = models.CharField(
        max_length=9,
        unique=True,
        validators=[RegexValidator(regex=r'^\d{9}$', message='תעודת זהות חייבת להכיל 9 ספרות')],
        verbose_name='תעודת זהות'
    )
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, verbose_name='שכבה', null=True, blank=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, verbose_name='הקבצה', null=True, blank=True)
    profile_image = models.ImageField(upload_to='media/students/', null=True, blank=True, verbose_name='תמונת פרופיל')
    phone = models.CharField(
        max_length=10,
        validators=[RegexValidator(regex=r'^0\d{9}$', message='מספר טלפון לא תקין')],
        verbose_name='טלפון',
        blank=True,
        null=True
    )
    address = models.TextField(verbose_name='כתובת', blank=True, null=True)
    birth_date = models.DateField(verbose_name='תאריך לידה', blank=True, null=True)
    notes = models.TextField(verbose_name='הערות', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='תאריך יצירה')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='תאריך עדכון')

    class Meta:
        verbose_name = 'תלמיד'
        verbose_name_plural = 'תלמידים'
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def get_full_name(self):
        """מחזיר שם מלא"""
        return f"{self.first_name} {self.last_name}"


class Assessment(models.Model):
    """מודל הערכה/ציון"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assessments', verbose_name='תלמיד')
    metric = models.IntegerField(choices=[(1, 'הערכה 1'), (2, 'הערכה 2'), (3, 'הערכה 3'), (4, 'הערכה 4'), (5, 'הערכה 5')], verbose_name='סוג הערכה')
    value = models.FloatField(verbose_name='ציון')
    date = models.DateField(verbose_name='תאריך')
    notes = models.TextField(blank=True, null=True, verbose_name='הערות')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='תאריך יצירה')
    
    class Meta:
        verbose_name = 'הערכה'
        verbose_name_plural = 'הערכות'
        ordering = ['-date', 'student']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - הערכה {self.metric}: {self.value}"


class Attendance(models.Model):
    """מודל נוכחות"""
    STATUS_CHOICES = [
        ('present', 'נוכח'),
        ('absent', 'נעדר'),
        ('late', 'מאחר'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records', verbose_name='תלמיד')
    date = models.DateField(verbose_name='תאריך')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, verbose_name='סטטוס')
    notes = models.TextField(blank=True, null=True, verbose_name='הערות')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='תאריך יצירה')
    
    class Meta:
        verbose_name = 'נוכחות'
        verbose_name_plural = 'נוכחויות'
        ordering = ['-date', 'student']
        unique_together = ['student', 'date']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.date} - {self.get_status_display()}"


class AuditTrail(models.Model):
    """מודל לוג שינויים"""
    entity = models.CharField(max_length=50, verbose_name='ישות')
    entity_id = models.IntegerField(verbose_name='מזהה ישות')
    field = models.CharField(max_length=50, verbose_name='שדה')
    old_value = models.TextField(blank=True, null=True, verbose_name='ערך ישן')
    new_value = models.TextField(blank=True, null=True, verbose_name='ערך חדש')
    user = models.CharField(max_length=50, verbose_name='משתמש')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='תאריך ושעה')
    
    class Meta:
        verbose_name = 'לוג שינוי'
        verbose_name_plural = 'לוג שינויים'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.entity} #{self.entity_id} - {self.field} - {self.timestamp}"
