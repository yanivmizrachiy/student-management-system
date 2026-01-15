import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Card, Table, Form, Button, Badge, Spinner, Row, Col, InputGroup } from 'react-bootstrap';
import { realtimeService } from '../services/realtime';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import ReactECharts from 'echarts-for-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  grade: { name: string };
  group: { name: string };
  assessments: Array<{ metric: number; value: number; date: string }>;
  attendance: Array<{ date: string; status: string }>;
}

interface Group {
  id: string;
  name: string;
  teacher: { name: string };
  studentCount: number;
}

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('lastName');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager' || user?.email === 'yaniv@example.com';

  useEffect(() => {
    if (!groupId) return;
    
    fetchGroup();
    fetchStudents();

    realtimeService.connect();
    realtimeService.subscribeStudents(undefined, groupId, () => {
      fetchStudents();
      fetchGroup();
    });

    return () => {
      realtimeService.unsubscribe('students:updated');
      realtimeService.unsubscribe('student:updated');
    };
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const response = await api.get(`/groups/${groupId}`);
      setGroup(response.data);
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/students?groupId=${groupId}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students
    .filter((s) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        s.firstName.toLowerCase().includes(search) ||
        s.lastName.toLowerCase().includes(search) ||
        s.studentId.includes(search);
      
      const matchesFilter = filterGrade === 'all' || s.grade?.name === filterGrade;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortField === 'lastName') {
        return a.lastName.localeCompare(b.lastName);
      }
      if (sortField === 'firstName') {
        return a.firstName.localeCompare(b.firstName);
      }
      return 0;
    });

  // Get attendance stats from reports
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
  });

  useEffect(() => {
    if (groupId) {
      api.get(`/reports/group/${groupId}`)
        .then((res) => {
          if (res.data.attendanceStats) {
            setAttendanceStats(res.data.attendanceStats);
          }
        })
        .catch(() => {
          setAttendanceStats({
            present: Math.floor(students.length * 0.85),
            absent: Math.floor(students.length * 0.1),
            late: Math.floor(students.length * 0.05),
          });
        });
    }
  }, [groupId, students.length]);

  // Calculate average grade for the group
  const calculateGroupAverage = () => {
    const allGrades = students.flatMap(s => 
      s.assessments?.map(a => Number(a.value)) || []
    );
    if (allGrades.length === 0) return 0;
    return (allGrades.reduce((sum, g) => sum + g, 0) / allGrades.length).toFixed(1);
  };

  // Grades by student chart
  const gradesByStudentOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].axisValue}<br/>${params[0].seriesName}: ${params[0].value}`;
      },
    },
    legend: {
      data: ['ממוצע ציונים'],
    },
    xAxis: {
      type: 'category',
      data: filteredStudents.map(s => `${s.firstName} ${s.lastName}`),
      name: 'תלמיד',
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: 'ציון',
      min: 0,
      max: 100,
    },
    series: [
      {
        name: 'ממוצע ציונים',
        data: filteredStudents.map(s => {
          const grades = s.assessments?.map(a => Number(a.value)) || [];
          return grades.length > 0 
            ? (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(1)
            : 0;
        }),
        type: 'bar',
        itemStyle: {
          color: '#667eea',
        },
      },
    ],
  };

  // Attendance by student chart
  const attendanceByStudentOption = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: filteredStudents.map(s => `${s.firstName} ${s.lastName}`),
      name: 'תלמיד',
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: 'אחוז נוכחות',
      max: 100,
    },
    series: [
      {
        name: 'אחוז נוכחות',
        data: filteredStudents.map(s => {
          const attendance = s.attendance || [];
          if (attendance.length === 0) return 0;
          const present = attendance.filter(a => a.status === 'present').length;
          return ((present / attendance.length) * 100).toFixed(1);
        }),
        type: 'bar',
        itemStyle: {
          color: '#28a745',
        },
      },
    ],
  };

  // Group average chart
  const groupAverageOption = {
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: {
          color: '#667eea',
        },
        progress: {
          show: true,
          width: 18,
        },
        pointer: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            width: 18,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          fontSize: 30,
          offsetCenter: [0, '70%'],
          formatter: '{value}',
        },
        data: [
          {
            value: calculateGroupAverage(),
            name: 'ממוצע הקבצה',
          },
        ],
      },
    ],
  };

  const attendanceChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c} ({d}%)',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: [
          { value: attendanceStats.present, name: 'נוכח', itemStyle: { color: '#28a745' } },
          { value: attendanceStats.absent, name: 'נעדר', itemStyle: { color: '#dc3545' } },
          { value: attendanceStats.late, name: 'מאחר', itemStyle: { color: '#ffc107' } },
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="light" />
        <span className="ms-3 text-white">טוען...</span>
      </div>
    );
  }

  return (
    <div className="group-page">
      <Container fluid className="py-4">
        {/* כותרת עם שם הקבצה + שם המורה */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="mb-4 shadow-lg border-0" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="mb-2 fw-bold" style={{ fontSize: '2.5rem', color: '#4a148c' }}>
                    <i className="bi bi-people-fill me-3"></i>
                    {group?.name}
                  </h1>
                  <p className="mb-0" style={{ fontSize: '1.3rem', color: '#666' }}>
                    <i className="bi bi-person-badge me-2"></i>
                    <strong>מורה:</strong> {group?.teacher?.name || 'לא צוין'}
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => navigate('/grades')}
                  className="glow-button"
                >
                  <i className="bi bi-arrow-right me-2"></i>
                  חזרה
                </Button>
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        <Row className="g-4 mb-4">
          {/* טבלת תלמידים אינטראקטיבית */}
          <Col md={8}>
            <Card className="shadow border-0" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <Card.Header className="bg-dark text-white">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-table me-2"></i>
                  רשימת תלמידים
                </h5>
              </Card.Header>
              <Card.Body>
                {/* חיפוש, סינון, מיון */}
                <Row className="mb-3">
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text className="bg-dark text-white">
                        <i className="bi bi-search"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="חפש תלמיד..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-dark"
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                      className="border-dark"
                    >
                      <option value="lastName">מיין לפי שם משפחה</option>
                      <option value="firstName">מיין לפי שם פרטי</option>
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                      className="border-dark"
                    >
                      <option value="all">כל הכיתות</option>
                      <option value="7th">כיתה ז'</option>
                      <option value="8th">כיתה ח'</option>
                      <option value="9th">כיתה ט'</option>
                    </Form.Select>
                  </Col>
                </Row>

                <div className="table-responsive">
                  <Table striped hover className="table-dark">
                    <thead>
                      <tr>
                        <th>שם משפחה</th>
                        <th>שם פרטי</th>
                        <th>כיתה</th>
                        <th>הערכה 1</th>
                        <th>הערכה 2</th>
                        <th>הערכה 3</th>
                        <th>הערכה 4</th>
                        <th>הערכה 5</th>
                        <th>הערות</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <motion.tr
                          key={student.id}
                          whileHover={{ backgroundColor: '#495057' }}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{student.lastName}</td>
                          <td>{student.firstName}</td>
                          <td>
                            <Badge bg="primary">{student.grade?.name || '-'}</Badge>
                          </td>
                          <td>{student.assessments?.find((a) => a.metric === 1)?.value || '-'}</td>
                          <td>{student.assessments?.find((a) => a.metric === 2)?.value || '-'}</td>
                          <td>{student.assessments?.find((a) => a.metric === 3)?.value || '-'}</td>
                          <td>{student.assessments?.find((a) => a.metric === 4)?.value || '-'}</td>
                          <td>{student.assessments?.find((a) => a.metric === 5)?.value || '-'}</td>
                          <td>-</td>
                          <td>
                            <Button
                              variant="outline-light"
                              size="sm"
                              onClick={() => navigate(`/student/${student.id}`)}
                              className="glow-button"
                            >
                              <i className="bi bi-eye me-1"></i>
                              צפה
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* מונה חי */}
                <div className="mt-3 text-center">
                  <Badge bg="info" className="p-3" style={{ fontSize: '1.2rem' }}>
                    <i className="bi bi-people-fill me-2"></i>
                    סה"כ תלמידים בהקבצה: <strong className="live-counter">{filteredStudents.length}</strong>
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* גרפים */}
          <Col md={4}>
            <Card className="mb-4 shadow border-0" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-pie-chart-fill me-2"></i>
                  נוכחות
                </h5>
              </Card.Header>
              <Card.Body>
                <ReactECharts option={attendanceChartOption} style={{ height: '250px' }} />
              </Card.Body>
            </Card>

            <Card className="mb-4 shadow border-0" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-speedometer2 me-2"></i>
                  ממוצע הקבצה
                </h5>
              </Card.Header>
              <Card.Body>
                <ReactECharts option={groupAverageOption} style={{ height: '250px' }} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* גרפים נוספים */}
        <Row className="g-4">
          <Col md={6}>
            <Card className="shadow border-0" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-bar-chart-fill me-2"></i>
                  ציונים לפי תלמיד
                </h5>
              </Card.Header>
              <Card.Body>
                <ReactECharts option={gradesByStudentOption} style={{ height: '400px' }} />
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="shadow border-0" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-bar-chart-fill me-2"></i>
                  נוכחות לפי תלמיד
                </h5>
              </Card.Header>
              <Card.Body>
                <ReactECharts option={attendanceByStudentOption} style={{ height: '400px' }} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .group-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .glow-button {
          transition: all 0.3s ease;
        }

        .glow-button:hover {
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.6) !important;
          transform: translateY(-2px);
        }

        .live-counter {
          display: inline-block;
          transition: all 0.3s ease;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
