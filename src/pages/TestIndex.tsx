const TestIndex = () => {
  console.log('TestIndex 컴포넌트 렌더링 시작');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'white', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        border: '2px solid #333', 
        padding: '20px', 
        marginBottom: '20px',
        backgroundColor: '#f0f0f0'
      }}>
        <h1 style={{ color: 'red', fontSize: '24px', margin: 0 }}>
          🧪 기본 테스트 페이지
        </h1>
        <p style={{ color: 'blue', margin: '10px 0' }}>
          React 컴포넌트가 정상적으로 렌더링되고 있습니다.
        </p>
      </div>
      
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '15px', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ color: 'green' }}>📊 더미 데이터 테스트</h2>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>삼성전자</span>
            <span style={{ color: 'green' }}>+1.5%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>SK하이닉스</span>
            <span style={{ color: 'red' }}>-2.3%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>카카오</span>
            <span style={{ color: 'green' }}>+0.8%</span>
          </div>
        </div>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h2 style={{ color: 'purple' }}>🔗 API 테스트</h2>
        <p>브라우저 개발자 도구(F12) → 콘솔/네트워크 탭 확인</p>
        <button 
          style={{ 
            marginTop: '10px', 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={async () => {
            console.log('API 테스트 버튼 클릭됨');
            try {
              console.log('API 호출 시작...');
              const response = await fetch('http://localhost:3001/api/balance/holdings');
              console.log('응답 받음:', response.status);
              const data = await response.json();
              console.log('데이터:', data);
              alert(`API 호출 성공! 종목 수: ${data.length}개`);
            } catch (error) {
              console.error('API 오류:', error);
              alert(`API 호출 실패: ${error.message}`);
            }
          }}
        >
          API 테스트 버튼
        </button>
      </div>
    </div>
  );
};

export default TestIndex;