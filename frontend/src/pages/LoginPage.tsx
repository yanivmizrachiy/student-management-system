import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [gradeCounts, setGradeCounts] = useState({
    grade7: 0,
    grade8: 0,
    grade9: 0,
    total: 0,
  });

  // Fetch live counts on mount and update every 5 seconds
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Create request config without auth for public endpoint
        // Don't send Authorization header at all for public endpoint
        const response = await api.get('/grades');
        const grades = response.data || [];
        const counts = {
          grade7: grades.find((g: any) => g.name === '7th' || g.name === 'ז' || g.name === 'כיתה ז')?.studentCount || 0,
          grade8: grades.find((g: any) => g.name === '8th' || g.name === 'ח' || g.name === 'כיתה ח')?.studentCount || 0,
          grade9: grades.find((g: any) => g.name === '9th' || g.name === 'ט' || g.name === 'כיתה ט')?.studentCount || 0,
          total: grades.reduce((sum: number, g: any) => sum + (g.studentCount || 0), 0),
        };
        setGradeCounts(counts);
      } catch (err: any) {
        // Log error for debugging but don't show to user
        if (err?.response?.status !== 401 && err?.response?.status !== 403) {
          console.warn('Error fetching grade counts:', err?.response?.status || err?.message);
        }
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email);
      navigate('/grades');
    } catch (err: any) {
      setError(err.response?.data?.message || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = async (gradeName: string) => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('auth-storage');
      let isLoggedIn = false;
      if (token) {
        try {
          const parsed = JSON.parse(token);
          if (parsed.state?.token) {
            isLoggedIn = true;
          }
        } catch (e) {
          // Invalid token
        }
      }

      // Get grades and find the selected grade
      const response = await api.get('/grades');
      const grades = response.data || [];
      const gradeNames = [
        gradeName === '7th' ? ['7th', 'ז', 'כיתה ז'] : 
        gradeName === '8th' ? ['8th', 'ח', 'כיתה ח'] : 
        ['9th', 'ט', 'כיתה ט']
      ].flat();
      
      const selectedGrade = grades.find((g: any) => 
        gradeNames.some(name => g.name === name || g.name?.includes(name))
      );

      if (selectedGrade) {
        // Navigate to grade page with gradeId in URL
        navigate(`/grades?gradeId=${selectedGrade.id}`);
      } else {
        // Grade not found - navigate to grades page anyway
        navigate('/grades');
      }
    } catch (err: any) {
      setError('שגיאה בטעינת נתוני הכיתה');
    }
  };

  return (
    <div className="login-page">
      <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5">
        <motion.div
          className="w-100"
          style={{ maxWidth: '900px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* כותרת גדולה */}
          <motion.h1
            className="text-center text-white mb-5 fw-bold"
            style={{ 
              fontSize: '3rem',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              letterSpacing: '2px'
            }}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            מערכת חכמה לניהול תלמידים
          </motion.h1>

          {/* טופס התחברות */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="login-card shadow-lg border-0 mb-5">
              <Card.Body className="p-5">
                <Form onSubmit={handleSubmit} className="mb-4">
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="email"
                      placeholder="אימייל"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      dir="ltr"
                      className="form-control-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                      }}
                    />
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" className="text-center">
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-100 btn-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
                    {loading ? 'מתחבר...' : 'התחבר'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </motion.div>

          {/* שלושה כפתורים תלת-ממדיים לשכבות */}
          <Row className="g-4 mb-5">
            <Col md={4}>
              <motion.button
                className="grade-button grade-7 p-5 rounded text-center text-white border-0 w-100 position-relative overflow-hidden"
                whileHover={{ 
                  scale: 1.08, 
                  y: -8,
                  boxShadow: '0 20px 50px rgba(198, 69, 105, 0.6), 0 0 40px rgba(255, 255, 255, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                onClick={() => handleGradeClick('7th')}
                style={{
                  background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
                  boxShadow: '0 15px 35px rgba(198, 69, 105, 0.4)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="position-relative" style={{ zIndex: 2 }}>
                  <div 
                    className="h1 mb-3 fw-bold" 
                    style={{ 
                      color: 'white',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      fontSize: '2.5rem'
                    }}
                  >
                    שכבה ז'
                  </div>
                  <div 
                    className="h4 fw-bold mb-3" 
                    style={{ 
                      color: 'white',
                      textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                      fontSize: '1.5rem'
                    }}
                  >
                    <i className="bi bi-people-fill me-2"></i>
                    <span className="live-counter">{gradeCounts.grade7}</span> תלמידים
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
            </Col>

            <Col md={4}>
              <motion.button
                className="grade-button grade-8 p-5 rounded text-center text-white border-0 w-100 position-relative overflow-hidden"
                whileHover={{ 
                  scale: 1.08, 
                  y: -8,
                  boxShadow: '0 20px 50px rgba(79, 172, 254, 0.6), 0 0 40px rgba(255, 255, 255, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                onClick={() => handleGradeClick('8th')}
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  boxShadow: '0 15px 35px rgba(79, 172, 254, 0.4)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="position-relative" style={{ zIndex: 2 }}>
                  <div 
                    className="h1 mb-3 fw-bold" 
                    style={{ 
                      color: 'white',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      fontSize: '2.5rem'
                    }}
                  >
                    שכבה ח'
                  </div>
                  <div 
                    className="h4 fw-bold mb-3" 
                    style={{ 
                      color: 'white',
                      textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                      fontSize: '1.5rem'
                    }}
                  >
                    <i className="bi bi-people-fill me-2"></i>
                    <span className="live-counter">{gradeCounts.grade8}</span> תלמידים
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
            </Col>

            <Col md={4}>
              <motion.button
                className="grade-button grade-9 p-5 rounded text-center text-white border-0 w-100 position-relative overflow-hidden"
                whileHover={{ 
                  scale: 1.08, 
                  y: -8,
                  boxShadow: '0 20px 50px rgba(67, 233, 123, 0.6), 0 0 40px rgba(255, 255, 255, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                onClick={() => handleGradeClick('9th')}
                style={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  boxShadow: '0 15px 35px rgba(67, 233, 123, 0.4)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="position-relative" style={{ zIndex: 2 }}>
                  <div 
                    className="h1 mb-3 fw-bold" 
                    style={{ 
                      color: 'white',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      fontSize: '2.5rem'
                    }}
                  >
                    שכבה ט'
                  </div>
                  <div 
                    className="h4 fw-bold mb-3" 
                    style={{ 
                      color: 'white',
                      textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                      fontSize: '1.5rem'
                    }}
                  >
                    <i className="bi bi-people-fill me-2"></i>
                    <span className="live-counter">{gradeCounts.grade9}</span> תלמידים
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
            </Col>
          </Row>

          {/* סיכום כולל בתחתית */}
          <motion.div
            className="text-center text-white mb-4"
            style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.6 }}
          >
            <div style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}>
              סה"כ תלמידים בבית הספר: <span className="live-counter" style={{ fontSize: '2rem', color: '#ffd700' }}>{gradeCounts.total}</span>
            </div>
          </motion.div>

          {/* קרדיט תחתון */}
          <motion.div
            className="text-center text-white-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <small style={{ fontSize: '1rem', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>
              האתר מנוהל ע"י <strong style={{ color: 'white' }}>יניב רז</strong>
            </small>
          </motion.div>
        </motion.div>
      </Container>

      <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%);
          position: relative;
          overflow: hidden;
        }

        /* Parallax effect */
        .login-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          animation: parallax 20s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes parallax {
          0%, 100% { 
            transform: translateY(0) translateX(0) scale(1); 
          }
          50% { 
            transform: translateY(-20px) translateX(10px) scale(1.05); 
          }
        }

        .login-card {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
                      0 0 40px rgba(138, 43, 226, 0.3) !important;
        }

        /* Glowing effect on buttons */
        .grade-button:hover .glow-effect {
          opacity: 1 !important;
        }

        .grade-button {
          transition: all 0.3s ease;
          position: relative;
        }

        .grade-button:focus {
          outline: none;
        }

        /* Live counter animation */
        .live-counter {
          display: inline-block;
          transition: all 0.3s ease;
          font-weight: bold;
        }

        .grade-button:hover .live-counter {
          transform: scale(1.2);
          color: #ffd700 !important;
        }

        /* Form controls */
        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        .form-control:focus {
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: rgba(255, 255, 255, 0.6) !important;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }

        /* Micro-interactions */
        .grade-button:hover {
          transform: translateY(-8px) scale(1.08) !important;
        }

        /* Smooth entrance animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
