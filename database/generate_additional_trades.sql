-- 추가 매매내역 생성 (나머지 830건)
-- 자동 생성을 위한 대량 INSERT 문

USE kpsdb;

-- 일일 소량 거래들 (830건)
INSERT INTO trading_history (
    account_number, trading_date, order_number, execution_number, 
    stock_code, buy_sell_code, order_quantity, order_amount
) VALUES