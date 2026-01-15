from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden, JsonResponse
from django.db.models import Q, Count, Avg
from django.views.decorators.http import require_http_methods
from .models import Student, Grade, Group, Assessment, Attendance, AuditTrail
from .forms import StudentForm
from .utils import is_manager, log_change


def login_page(request):
    """דף כניסה ראשי"""
    # ספירת תלמידים לפי שכבות
    grade_counts = {
        'ז': 0,
        'ח': 0,
        'ט': 0,
    }
    total_students = 0
    
    # חיפוש שכבות לפי שם
    for grade_name in ['ז', 'ח', 'ט', '7th', '8th', '9th']:
        try:
            grade = Grade.objects.get(name=grade_name)
            count = grade.get_student_count()
            # מיפוי לשמות עבריים
            if grade_name in ['ז', '7th']:
                grade_counts['ז'] = count
            elif grade_name in ['ח', '8th']:
                grade_counts['ח'] = count
            elif grade_name in ['ט', '9th']:
                grade_counts['ט'] = count
            total_students += count
        except Grade.DoesNotExist:
            continue
    
    context = {
        'grade_counts': grade_counts,
        'total_students': total_students,
    }
    return render(request, 'students/login_page.html', context)


def grade_page(request, grade_name):
    """דף שכבה - מציג את כל ההקבצות בשכבה"""
    grade = get_object_or_404(Grade, name=grade_name)
    groups = Group.objects.filter(grade=grade).annotate(
        student_count=Count('student')
    )
    
    total_students = grade.get_student_count()
    
    context = {
        'grade': grade,
        'groups': groups,
        'total_students': total_students,
    }
    return render(request, 'students/grade_page.html', context)


def group_page(request, group_id):
    """דף הקבצה - מציג את כל התלמידים בהקבצה"""
    group = get_object_or_404(Group, id=group_id)
    students = Student.objects.filter(group=group).select_related('grade')
    
    # חיפוש וסינון
    search_query = request.GET.get('search', '')
    sort_field = request.GET.get('sort', 'last_name')
    
    if search_query:
        students = students.filter(
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(id_number__icontains=search_query)
        )
    
    if sort_field == 'first_name':
        students = students.order_by('first_name', 'last_name')
    else:
        students = students.order_by('last_name', 'first_name')
    
    # חישוב סטטיסטיקות
    attendance_stats = {
        'present': Attendance.objects.filter(student__group=group, status='present').count(),
        'absent': Attendance.objects.filter(student__group=group, status='absent').count(),
        'late': Attendance.objects.filter(student__group=group, status='late').count(),
    }
    
    # ממוצע ציונים
    avg_grade = Assessment.objects.filter(student__group=group).aggregate(
        avg=Avg('value')
    )['avg'] or 0
    
    context = {
        'group': group,
        'students': students,
        'search_query': search_query,
        'sort_field': sort_field,
        'attendance_stats': attendance_stats,
        'avg_grade': round(avg_grade, 1),
        'student_count': students.count(),
    }
    return render(request, 'students/group_page.html', context)


@login_required
def student_detail(request, pk):
    """דף פרופיל תלמיד"""
    student = get_object_or_404(Student, pk=pk)
    
    # הערכות
    assessments = Assessment.objects.filter(student=student).order_by('-date')
    
    # נוכחות
    attendance = Attendance.objects.filter(student=student).order_by('-date')
    
    # Audit Trail
    audit_logs = AuditTrail.objects.filter(
        entity='Student',
        entity_id=student.id
    ).order_by('-timestamp')
    
    # קבצים (אם יש)
    files = []  # ניתן להוסיף מודל File בעתיד
    
    context = {
        'student': student,
        'assessments': assessments,
        'attendance': attendance,
        'audit_logs': audit_logs,
        'files': files,
        'is_manager': is_manager(request.user),
    }
    return render(request, 'students/student_detail.html', context)


@login_required
def student_create(request):
    """דף הוספת תלמיד חדש - רק למנהל"""
    if not is_manager(request.user):
        return HttpResponseForbidden("צפייה בלבד - רק מנהל יכול להוסיף תלמידים")
    
    if request.method == 'POST':
        form = StudentForm(request.POST, request.FILES)
        if form.is_valid():
            student = form.save()
            log_change('Student', student.id, 'created', '', str(student), request.user)
            messages.success(request, 'התלמיד נוסף בהצלחה!')
            return redirect('student_detail', pk=student.pk)
    else:
        form = StudentForm()
    
    context = {
        'form': form,
        'title': 'הוספת תלמיד חדש',
    }
    return render(request, 'students/student_form.html', context)


@login_required
def student_update(request, pk):
    """דף עריכת תלמיד - רק למנהל"""
    if not is_manager(request.user):
        return HttpResponseForbidden("צפייה בלבד - רק מנהל יכול לערוך תלמידים")
    
    student = get_object_or_404(Student, pk=pk)
    
    if request.method == 'POST':
        form = StudentForm(request.POST, request.FILES, instance=student)
        if form.is_valid():
            # שמירת ערכים ישנים
            old_values = {
                'first_name': student.first_name,
                'last_name': student.last_name,
                'grade': student.grade.name,
                'group': student.group.name,
            }
            
            student = form.save()
            
            # לוג שינויים
            for field, old_value in old_values.items():
                new_value = getattr(student, field)
                if field in ['grade', 'group']:
                    new_value = new_value.name if hasattr(new_value, 'name') else str(new_value)
                if str(old_value) != str(new_value):
                    log_change('Student', student.id, field, old_value, new_value, request.user)
            
            messages.success(request, 'התלמיד עודכן בהצלחה!')
            return redirect('student_detail', pk=student.pk)
    else:
        form = StudentForm(instance=student)
    
    context = {
        'form': form,
        'student': student,
        'title': 'עריכת תלמיד',
    }
    return render(request, 'students/student_form.html', context)


@login_required
@require_http_methods(["POST"])
def student_delete(request, pk):
    """מחיקת תלמיד - רק למנהל"""
    if not is_manager(request.user):
        return HttpResponseForbidden("צפייה בלבד - רק מנהל יכול למחוק תלמידים")
    
    student = get_object_or_404(Student, pk=pk)
    log_change('Student', student.id, 'deleted', str(student), '', request.user)
    student.delete()
    messages.success(request, 'התלמיד נמחק בהצלחה!')
    return redirect('login_page')


def student_list(request):
    """דף רשימת תלמידים עם חיפוש"""
    students = Student.objects.select_related('grade', 'group').all()
    search_query = request.GET.get('search', '')
    
    if search_query:
        students = students.filter(
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(id_number__icontains=search_query) |
            Q(grade__name__icontains=search_query) |
            Q(group__name__icontains=search_query)
        )
    
    context = {
        'students': students,
        'search_query': search_query,
        'is_manager': is_manager(request.user) if request.user.is_authenticated else False,
    }
    return render(request, 'students/student_list.html', context)
