from django import forms
from .models import Student, Grade, Group


class StudentForm(forms.ModelForm):
    """טופס להוספה ועריכה של תלמיד"""
    
    class Meta:
        model = Student
        fields = [
            'first_name', 'last_name', 'id_number', 'grade', 'group',
            'profile_image', 'phone', 'address', 'birth_date', 'notes'
        ]
        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'הזן שם פרטי',
                'dir': 'rtl'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'הזן שם משפחה',
                'dir': 'rtl'
            }),
            'id_number': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'הזן תעודת זהות (9 ספרות)',
                'maxlength': '9',
                'dir': 'ltr'
            }),
            'grade': forms.Select(attrs={
                'class': 'form-select',
            }),
            'group': forms.Select(attrs={
                'class': 'form-select',
            }),
            'profile_image': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'הזן מספר טלפון',
                'maxlength': '10',
                'dir': 'ltr'
            }),
            'address': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'הזן כתובת',
                'rows': 3,
                'dir': 'rtl'
            }),
            'birth_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date',
                'dir': 'ltr'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'הערות נוספות',
                'rows': 4,
                'dir': 'rtl'
            }),
        }
        labels = {
            'first_name': 'שם פרטי',
            'last_name': 'שם משפחה',
            'id_number': 'תעודת זהות',
            'grade': 'שכבה',
            'group': 'הקבצה',
            'profile_image': 'תמונת פרופיל',
            'phone': 'טלפון',
            'address': 'כתובת',
            'birth_date': 'תאריך לידה',
            'notes': 'הערות',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['grade'].queryset = Grade.objects.all()
        self.fields['group'].queryset = Group.objects.all()
        
        # אם יש grade נבחר, סינון הקבצות לפי השכבה
        if self.instance and self.instance.pk and self.instance.grade:
            self.fields['group'].queryset = Group.objects.filter(grade=self.instance.grade)
        
        # הוספת class לכל השדות
        for field_name, field in self.fields.items():
            if 'class' not in field.widget.attrs:
                field.widget.attrs['class'] = 'form-control'
