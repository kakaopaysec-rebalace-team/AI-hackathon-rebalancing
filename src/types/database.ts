// 데이터베이스 스키마에 대응하는 TypeScript 타입 정의

/** 고객잔고 테이블 타입 */
export interface CustomerBalance {
  id: number; // 고유ID (PK, AUTO_INCREMENT)
  account_number: string; // 계좌번호 (12자리)
  stock_code: string; // 종목코드
  stock_name: string; // 종목명
  quantity: number; // 수량
  purchase_amount: number; // 매수금액
  created_at: Date; // 생성일시
  updated_at: Date; // 수정일시
}

/** 매매내역 테이블 타입 */
export interface TradingHistory {
  account_number: string; // 계좌번호 (12자리)
  trading_date: string; // 매매일자 (YYYYMMDD)
  order_number: string; // 주문번호
  execution_number: string; // 체결번호
  stock_code: string; // 종목코드
  buy_sell_code: '1' | '2'; // 매수매도구분코드 (1:매수, 2:매도)
  order_quantity: number; // 주문수량
  order_amount: number; // 주문금액
  created_at: Date; // 생성일시
}

/** 종목현재가 테이블 타입 */
export interface StockCurrentPrice {
  stock_code: string; // 종목코드
  current_price: number; // 현재가
  updated_at: Date; // 수정일시
}

/** 고객전략 테이블 타입 */
export interface CustomerStrategy {
  account_number: string; // 계좌번호 (12자리)
  rebalancing_strategy_code: string; // 리밸런싱전략코드
  rebalancing_cycle: number; // 리밸런싱주기 (일)
  allowed_deviation: number; // 허용편차 (%)
  rebalancing_yn: 'Y' | 'N'; // 리밸런싱YN
  created_at: Date; // 생성일시
  updated_at: Date; // 수정일시
}

/** 위험도 타입 */
export type RiskLevel = '초저위험' | '저위험' | '중위험' | '고위험' | '초고위험';

/** 투자스타일 타입 */
export type InvestmentStyle = 
  | '가치투자' 
  | '성장투자' 
  | '배당투자' 
  | '지수추종' 
  | '단기/스윙' 
  | '퀀트/시스템트레이딩' 
  | '테마/모멘텀';

/** 리밸런싱마스터 테이블 타입 */
export interface RebalancingMaster {
  rebalancing_strategy_code: string; // 리밸런싱전략코드
  rebalancing_name: string; // 리밸런싱이름
  rebalancing_description?: string; // 리밸런싱설명
  risk_level: RiskLevel; // 위험도
  investment_style: InvestmentStyle; // 투자스타일
  keyword1?: string; // 키워드1
  keyword2?: string; // 키워드2
  keyword3?: string; // 키워드3
  created_at: Date; // 생성일시
  updated_at: Date; // 수정일시
}

/** 리밸런싱분석 테이블 타입 */
export interface RebalancingAnalysis {
  rebalancing_strategy_code: string; // 리밸런싱전략코드
  expected_return: number; // 예상수익률 (%)
  volatility: number; // 변동성 (%)
  max_drawdown: number; // 최대낙폭 (%)
  investor_preference: number; // 투자자선호도 (점수)
  created_at: Date; // 생성일시
  updated_at: Date; // 수정일시
}

// === 조인을 위한 확장 타입들 ===

/** 고객잔고 + 종목현재가 조인 타입 */
export interface CustomerBalanceWithPrice extends CustomerBalance {
  current_price: number; // 현재가
  current_value: number; // 현재가치 (계산된 값)
  unrealized_pnl: number; // 미실현손익 (계산된 값)
  unrealized_pnl_rate: number; // 미실현손익률 (계산된 값)
}

/** 고객 + 전략 + 분석 정보 조인 타입 */
export interface CustomerStrategyDetail extends CustomerStrategy {
  rebalancing_name: string;
  rebalancing_description?: string;
  risk_level: RiskLevel;
  investment_style: InvestmentStyle;
  keyword1?: string;
  keyword2?: string;
  keyword3?: string;
  expected_return: number;
  volatility: number;
  max_drawdown: number;
  investor_preference: number;
}

/** 매매내역 + 종목정보 조인 타입 */
export interface TradingHistoryDetail extends TradingHistory {
  stock_name: string; // 종목명
  current_price: number; // 현재가
}

// === API 요청/응답을 위한 타입들 ===

/** 고객잔고 생성 요청 타입 */
export interface CreateCustomerBalanceRequest {
  account_number: string;
  stock_code: string;
  stock_name: string;
  quantity: number;
  purchase_amount: number;
}

/** 고객잔고 수정 요청 타입 */
export interface UpdateCustomerBalanceRequest {
  id: number; // PK
  stock_name?: string;
  quantity?: number;
  purchase_amount?: number;
}

/** 매매내역 생성 요청 타입 */
export interface CreateTradingHistoryRequest {
  account_number: string;
  trading_date: string;
  order_number: string;
  execution_number: string;
  stock_code: string;
  buy_sell_code: '1' | '2';
  order_quantity: number;
  order_amount: number;
}

/** 종목현재가 업데이트 요청 타입 */
export interface UpdateStockPriceRequest {
  stock_code: string;
  current_price: number;
}

/** 고객전략 생성/수정 요청 타입 */
export interface UpsertCustomerStrategyRequest {
  account_number: string;
  rebalancing_strategy_code: string;
  rebalancing_cycle: number;
  allowed_deviation: number;
  rebalancing_yn: 'Y' | 'N';
}

/** 리밸런싱전략 생성 요청 타입 */
export interface CreateRebalancingStrategyRequest {
  rebalancing_strategy_code: string;
  rebalancing_name: string;
  rebalancing_description?: string;
  risk_level: RiskLevel;
  investment_style: InvestmentStyle;
  keyword1?: string;
  keyword2?: string;
  keyword3?: string;
  expected_return: number;
  volatility: number;
  max_drawdown: number;
  investor_preference: number;
}

// === 유틸리티 타입들 ===

/** 매수매도 구분 코드 */
export const BUY_SELL_CODE = {
  BUY: '1' as const,
  SELL: '2' as const,
} as const;

/** 리밸런싱 사용 여부 */
export const REBALANCING_YN = {
  YES: 'Y' as const,
  NO: 'N' as const,
} as const;

/** 위험도 레벨 배열 */
export const RISK_LEVELS: RiskLevel[] = [
  '초저위험',
  '저위험', 
  '중위험',
  '고위험',
  '초고위험'
];

/** 투자스타일 배열 */
export const INVESTMENT_STYLES: InvestmentStyle[] = [
  '가치투자',
  '성장투자',
  '배당투자', 
  '지수추종',
  '단기/스윙',
  '퀀트/시스템트레이딩',
  '테마/모멘텀'
];