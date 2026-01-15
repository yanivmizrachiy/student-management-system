from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_page, name='login_page'),
    path('grades/<str:grade_name>/', views.grade_page, name='grade_page'),
    path('group/<int:group_id>/', views.group_page, name='group_page'),
    path('students/', views.student_list, name='student_list'),
    path('student/add/', views.student_create, name='student_create'),
    path('student/<int:pk>/', views.student_detail, name='student_detail'),
    path('student/<int:pk>/edit/', views.student_update, name='student_update'),
    path('student/<int:pk>/delete/', views.student_delete, name='student_delete'),
]

