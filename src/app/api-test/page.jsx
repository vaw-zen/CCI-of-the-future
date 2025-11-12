'use client';

import { useEffect, useState } from 'react';

export default function ApiTest() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      console.log('Testing /api/devis/test...');
      const testResponse = await fetch('/api/devis/test');
      const testResult = await testResponse.json();
      console.log('Test response:', testResult);

      console.log('Testing /api/devis/list...');
      const listResponse = await fetch('/api/devis/list?limit=5');
      const listResult = await listResponse.json();
      console.log('List response:', listResult);

      setTestResults({
        test: {
          status: testResponse.status,
          data: testResult
        },
        list: {
          status: listResponse.status,
          data: listResult
        }
      });
    } catch (error) {
      console.error('Test error:', error);
      setTestResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 API Test Results</h1>
      
      <button onClick={testApi} disabled={loading} style={{
        padding: '10px 20px',
        backgroundColor: loading ? '#ccc' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: loading ? 'not-allowed' : 'pointer',
        marginBottom: '20px'
      }}>
        {loading ? 'Testing...' : 'Test Again'}
      </button>

      {testResults && (
        <pre style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          overflow: 'auto',
          maxHeight: '500px'
        }}>
          {JSON.stringify(testResults, null, 2)}
        </pre>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Check Browser Console</h3>
        <p>Open Developer Tools (F12) → Console tab to see detailed logs</p>
      </div>
    </div>
  );
}