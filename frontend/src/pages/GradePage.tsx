import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Card, Button, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { realtimeService } from '../services/realtime';
import api from '../services/api';

interface Grade {
  id: string;
  name: string;
  studentCount: number;
}

interface Group {
  id: string;
  name: string;
  teacher: { name: string };
  studentCount: number;
}

export default function GradePage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, user } = useAuthStore();
  const isManager = user?.role === 'manager' || user?.email === 'yaniv@example.com';

  useEffect(() => {
    fetchGrades();

    realtimeService.connect();
    realtimeService.subscribeGrades(() => {
      fetchGrades();
    });

    return () => {
      realtimeService.unsubscribe('grades:updated');
      realtimeService.unsubscribe('grade:updated');
    };
  }, []);

  // React to URL parameter changes
  useEffect(() => {
    const gradeIdFromUrl = searchParams.get('gradeId');
    if (gradeIdFromUrl && grades.length > 0) {
      const gradeFromUrl = grades.find((g: Grade) => g.id === gradeIdFromUrl);
      if (gradeFromUrl && selectedGrade?.id !== gradeFromUrl.id) {
        setSelectedGrade(gradeFromUrl);
      }
    }
  }, [searchParams, grades]);

  useEffect(() => {
    if (selectedGrade) {
      fetchGroups(selectedGrade.id);
      realtimeService.subscribeGroups(selectedGrade.id, () => {
        fetchGroups(selectedGrade.id);
      });
    }

    return () => {
      realtimeService.unsubscribe('groups:updated');
      realtimeService.unsubscribe('group:updated');
    };
  }, [selectedGrade]);

  const fetchGrades = async () => {
    try {
      const response = await api.get('/grades');
      setGrades(response.data);
      
      // Check if gradeId is in URL params
      const gradeIdFromUrl = searchParams.get('gradeId');
      if (gradeIdFromUrl && response.data.length > 0) {
        const gradeFromUrl = response.data.find((g: Grade) => g.id === gradeIdFromUrl);
        if (gradeFromUrl) {
          setSelectedGrade(gradeFromUrl);
        } else if (!selectedGrade) {
          // If grade from URL not found, select first grade
          setSelectedGrade(response.data[0]);
        }
      } else if (response.data.length > 0 && !selectedGrade) {
        setSelectedGrade(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async (gradeId: string) => {
    try {
      const response = await api.get(`/groups?gradeId=${gradeId}`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="light" />
        <span className="ms-3 text-white">טוען...</span>
      </div>
    );
  }

  const totalStudents = groups.reduce((sum, g) => sum + g.studentCount, 0);

  // Convert grade name to Hebrew format
  const getGradeDisplayName = (name: string) => {
    const gradeMap: { [key: string]: string } = {
      '7th': 'שכבת ז\'',
      '8th': 'שכבת ח\'',
      '9th': 'שכבת ט\'',
      'ז': 'שכבת ז\'',
      'ח': 'שכבת ח\'',
      'ט': 'שכבת ט\'',
    };
    return gradeMap[name] || `שכבת ${name}`;
  };

  return (
    <div className="grade-page">
      <Container fluid className="py-4">
        {/* כותרת גדולה עם שם השכבה */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="mb-4 shadow-lg border-0" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="mb-0 fw-bold" style={{ fontSize: '2.5rem', color: '#4a148c' }}>
                    <i className="bi bi-mortarboard-fill me-3"></i>
                    {selectedGrade ? getGradeDisplayName(selectedGrade.name) : 'בחר שכבה'}
                  </h1>
                  <p className="text-muted mb-0 mt-2">
                    <i className="bi bi-person-fill me-2"></i>
                    {user?.name || 'משתמש'}
                  </p>
                </div>
                <Button variant="danger" size="lg" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  התנתק
                </Button>
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        {/* בחירת שכבה */}
        <Card className="mb-4 shadow border-0" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
          <Card.Body>
            <h5 className="mb-3 fw-bold">בחר שכבה:</h5>
            <div className="d-flex gap-2 flex-wrap">
              {grades.map((grade) => (
                <motion.div
                  key={grade.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedGrade?.id === grade.id ? 'primary' : 'outline-primary'}
                    size="lg"
                    onClick={() => setSelectedGrade(grade)}
                    className="me-2"
                    style={{
                      background: selectedGrade?.id === grade.id 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : 'transparent',
                      border: '2px solid #667eea',
                      fontWeight: 'bold',
                    }}
                  >
                    {getGradeDisplayName(grade.name)}
                    <Badge bg="light" text="dark" className="ms-2">
                      {grade.studentCount}
                    </Badge>
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* כפתורים תלת-ממדיים לכל הקבצה */}
        <Row className="g-4 mb-4">
          {groups.map((group, index) => (
            <Col key={group.id} md={6} lg={4}>
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <motion.button
                  className="group-button-card w-100 h-100 border-0 rounded p-4 text-start text-white position-relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -8,
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4), 0 0 30px rgba(255, 255, 255, 0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/group/${group.id}`)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                    cursor: 'pointer',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="position-relative" style={{ zIndex: 2 }}>
                    <h3 className="mb-3 fw-bold" style={{ color: 'white', textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}>
                      {group.name}
                    </h3>
                    <p className="mb-3" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
                      <i className="bi bi-person-badge me-2"></i>
                      <strong>מורה:</strong> {group.teacher?.name || 'לא צוין'}
                    </p>
                    <div className="d-flex align-items-center" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                      <i className="bi bi-people-fill me-2"></i>
                      <span className="live-counter">{group.studentCount}</span> תלמידים
                    </div>
                  </div>
                  <div 
                    className="glow-effect"
                    style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                    }}
                  />
                </motion.button>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* סיכום כולל בתחתית */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-lg border-0" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
            <Card.Body className="text-center p-4">
              <h3 className="mb-0 fw-bold" style={{ color: '#4a148c' }}>
                <i className="bi bi-graph-up me-3"></i>
                סה"כ תלמידים בשכבה: <span className="text-primary" style={{ fontSize: '2rem' }}>{totalStudents}</span>
              </h3>
            </Card.Body>
          </Card>
        </motion.div>
      </Container>

      <style>{`
        .grade-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .group-button-card:hover .glow-effect {
          opacity: 1 !important;
        }

        .group-button-card:focus {
          outline: none;
        }

        .live-counter {
          display: inline-block;
          transition: all 0.3s ease;
          font-weight: bold;
        }

        .group-button-card:hover .live-counter {
          transform: scale(1.2);
          color: #ffd700 !important;
        }
      `}</style>
    </div>
  );
}
