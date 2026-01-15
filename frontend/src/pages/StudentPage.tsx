import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Card,
  Button,
  Badge,
  Spinner,
  Row,
  Col,
  Nav,
  Tab,
  Table,
  Image,
  Alert,
} from 'react-bootstrap';
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
  profileImageUrl?: string;
  assessments: Array<{ date: string; metric: number; value: number }>;
  attendance: Array<{ date: string; status: string }>;
  files?: Array<{ id: string; type: string; url: string; name: string }>;
}

interface AuditLog {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  user: { name: string };
}

export default function StudentPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager' || user?.email === 'yaniv@example.com';

  useEffect(() => {
    if (!studentId) return;
    fetchStudent();
    fetchAuditLogs();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const response = await api.get(`/students/${studentId}`);
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get(`/audit/Student/${studentId}`);
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  if (loading || !student) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="light" />
        <span className="ms-3 text-white">טוען...</span>
      </div>
    );
  }

  // Grades over time line chart
  const sortedAssessments = [...(student.assessments || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const gradesChartOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].axisValue}<br/>${params[0].seriesName}: ${params[0].value}`;
      },
    },
    legend: {
      data: ['ציונים'],
    },
    xAxis: {
      type: 'category',
      data: sortedAssessments.map((a) => new Date(a.date).toLocaleDateString('he-IL')),
      name: 'תאריך',
    },
    yAxis: {
      type: 'value',
      name: 'ציון',
      min: 0,
      max: 100,
    },
    series: [
      {
        name: 'ציונים',
        data: sortedAssessments.map((a) => Number(a.value)),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#667eea' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.1)' },
            ],
          },
        },
      },
    ],
  };

  // Attendance bar chart
  const sortedAttendance = [...(student.attendance || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const attendanceChartOption = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: sortedAttendance.map((a) => new Date(a.date).toLocaleDateString('he-IL')),
      name: 'תאריך',
    },
    yAxis: {
      type: 'value',
      name: 'סטטוס',
      max: 1,
    },
    series: [
      {
        data: sortedAttendance.map((a) =>
          a.status === 'present' ? 1 : a.status === 'late' ? 0.5 : 0,
        ),
        type: 'bar',
        itemStyle: {
          color: (params: any) => {
            const status = sortedAttendance[params.dataIndex]?.status;
            if (status === 'present') return '#28a745';
            if (status === 'late') return '#ffc107';
            return '#dc3545';
          },
        },
      },
    ],
  };

  return (
    <div className="student-page">
      <Container fluid className="py-4">
        <Card className="mb-4 shadow">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-0">
                  <i className="bi bi-person-fill me-2 text-primary"></i>
                  {student.firstName} {student.lastName}
                </h1>
                <p className="text-muted mb-0 mt-2">
                  {student.grade?.name} - {student.group?.name}
                </p>
              </div>
              <div className="d-flex gap-2">
                {isManager && (
                  <Button variant="warning">
                    <i className="bi bi-pencil-fill me-2"></i>
                    ערוך
                  </Button>
                )}
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  <i className="bi bi-arrow-right me-2"></i>
                  חזרה
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="shadow">
              <Card.Body className="text-center">
                {student.profileImageUrl ? (
                  <Image
                    src={student.profileImageUrl}
                    roundedCircle
                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    className="mb-3"
                  />
                ) : (
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontSize: '4rem',
                    }}
                  >
                    <i className="bi bi-person-fill"></i>
                  </div>
                )}
                <h4 className="mb-3">{student.firstName} {student.lastName}</h4>
                <Table borderless className="text-start">
                  <tbody>
                    <tr>
                      <td><strong>מספר תלמיד:</strong></td>
                      <td>{student.studentId}</td>
                    </tr>
                    <tr>
                      <td><strong>כיתה:</strong></td>
                      <td>{student.grade?.name || 'לא צוין'}</td>
                    </tr>
                    <tr>
                      <td><strong>קבוצה:</strong></td>
                      <td>{student.group?.name || 'לא צוין'}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            <Card className="shadow">
              <Card.Header>
                <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
                  <Nav.Item>
                    <Nav.Link eventKey="profile">
                      <i className="bi bi-person me-2"></i>
                      פרופיל
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="grades">
                      <i className="bi bi-graph-up me-2"></i>
                      ציונים
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="attendance">
                      <i className="bi bi-calendar-check me-2"></i>
                      נוכחות
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="audit">
                      <i className="bi bi-clock-history me-2"></i>
                      היסטוריית שינויים
                    </Nav.Link>
                  </Nav.Item>
                  {student.files && student.files.length > 0 && (
                    <Nav.Item>
                      <Nav.Link eventKey="files">
                        <i className="bi bi-files me-2"></i>
                        קבצים
                        <Badge bg="primary" className="ms-2">
                          {student.files.length}
                        </Badge>
                      </Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="profile" active={activeTab === 'profile'}>
                    <Row>
                      <Col md={6}>
                        <h5 className="mb-3">פרטים אישיים</h5>
                        <Table borderless>
                          <tbody>
                            <tr>
                              <td><strong>שם פרטי:</strong></td>
                              <td>{student.firstName}</td>
                            </tr>
                            <tr>
                              <td><strong>שם משפחה:</strong></td>
                              <td>{student.lastName}</td>
                            </tr>
                            <tr>
                              <td><strong>מספר תלמיד:</strong></td>
                              <td>{student.studentId}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                      <Col md={6}>
                        <h5 className="mb-3">פרטי לימודים</h5>
                        <Table borderless>
                          <tbody>
                            <tr>
                              <td><strong>כיתה:</strong></td>
                              <td>
                                <Badge bg="primary">{student.grade?.name}</Badge>
                              </td>
                            </tr>
                            <tr>
                              <td><strong>קבוצה:</strong></td>
                              <td>
                                <Badge bg="info">{student.group?.name}</Badge>
                              </td>
                            </tr>
                            <tr>
                              <td><strong>מספר הערכות:</strong></td>
                              <td>
                                <Badge bg="success">{student.assessments?.length || 0}</Badge>
                              </td>
                            </tr>
                            <tr>
                              <td><strong>מספר נוכחויות:</strong></td>
                              <td>
                                <Badge bg="warning">{student.attendance?.length || 0}</Badge>
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  <Tab.Pane eventKey="grades" active={activeTab === 'grades'}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ReactECharts option={gradesChartOption} style={{ height: '400px' }} />
                    </motion.div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="attendance" active={activeTab === 'attendance'}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ReactECharts option={attendanceChartOption} style={{ height: '400px' }} />
                    </motion.div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="audit" active={activeTab === 'audit'}>
                    {auditLogs.length === 0 ? (
                      <Alert variant="info">אין שינויים להצגה</Alert>
                    ) : (
                      <div className="table-responsive">
                        <Table striped hover>
                          <thead>
                            <tr>
                              <th>שדה</th>
                              <th>ערך ישן</th>
                              <th>ערך חדש</th>
                              <th>משתמש</th>
                              <th>תאריך</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditLogs.map((log) => (
                              <tr key={log.id}>
                                <td>{log.field}</td>
                                <td>{log.oldValue || '-'}</td>
                                <td>{log.newValue || '-'}</td>
                                <td>{log.user?.name || 'לא צוין'}</td>
                                <td>
                                  {new Date(log.timestamp).toLocaleString('he-IL')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Tab.Pane>

                  {student.files && (
                    <Tab.Pane eventKey="files" active={activeTab === 'files'}>
                      <Table striped hover>
                        <thead>
                          <tr>
                            <th>שם קובץ</th>
                            <th>סוג</th>
                            <th>פעולות</th>
                          </tr>
                        </thead>
                        <tbody>
                          {student.files.map((file) => (
                            <tr key={file.id}>
                              <td>{file.name || file.url}</td>
                              <td>
                                <Badge bg="secondary">{file.type}</Badge>
                              </td>
                              <td>
                                <Button variant="outline-primary" size="sm" href={file.url} target="_blank">
                                  <i className="bi bi-download me-1"></i>
                                  הורד
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Tab.Pane>
                  )}
                </Tab.Content>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .student-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
    </div>
  );
}
