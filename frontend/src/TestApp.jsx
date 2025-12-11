import React from 'react';

function TestApp() {
  console.log('TestApp is rendering!');
  
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'green',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h1>✅ REACT TEST APP WORKING</h1>
        <p>If you see this, React is working fine</p>
        <p>Time: {new Date().toISOString()}</p>
      </div>
      
      <div style={{
        background: '#1e293b',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h2>Learning Hub Content</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{
            background: '#334155',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '10px' }}>🎓</div>
            <h3>Complete Forex Trading Mastery</h3>
            <p style={{ color: '#94a3b8' }}>Master the fundamentals of forex trading from beginner to advanced level</p>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#94a3b8' }}>Duration:</span>
                <span>12 hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#94a3b8' }}>Lessons:</span>
                <span>24</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ color: '#94a3b8' }}>Level:</span>
                <span>Beginner to Advanced</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>Free</span>
                <button style={{
                  background: '#059669',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  Start Learning
                </button>
              </div>
            </div>
          </div>
          
          <div style={{
            background: '#334155',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '10px' }}>📊</div>
            <h3>Advanced Price Action Strategies</h3>
            <p style={{ color: '#94a3b8' }}>Learn professional price action techniques used by institutional traders</p>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#94a3b8' }}>Duration:</span>
                <span>8 hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#94a3b8' }}>Lessons:</span>
                <span>16</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ color: '#94a3b8' }}>Level:</span>
                <span>Intermediate</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>$99</span>
                <button style={{
                  background: '#059669',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
          
          <div style={{
            background: '#334155',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '10px' }}>🧠</div>
            <h3>Trading Psychology Mastery</h3>
            <p style={{ color: '#94a3b8' }}>Develop the mental discipline required for consistent trading success</p>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#94a3b8' }}>Duration:</span>
                <span>6 hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#94a3b8' }}>Lessons:</span>
                <span>12</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ color: '#94a3b8' }}>Level:</span>
                <span>All Levels</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>$79</span>
                <button style={{
                  background: '#059669',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{
        background: '#dc2626',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '20px',
        textAlign: 'center'
      }}>
        <strong>🔧 DEBUGGING INFO</strong><br/>
        This is a minimal React component to test if the issue is with React rendering or something else.
      </div>
    </div>
  );
}

export default TestApp;