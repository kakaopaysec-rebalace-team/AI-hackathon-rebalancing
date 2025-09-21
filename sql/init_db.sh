mysql -u rebalance -p'Kakaopay2025!' kpsdb < create_tables_final.sql
mysql -u rebalance -p'Kakaopay2025!' kpsdb < add_rebalancing_weight_column.sql
mysql -u rebalance -p'Kakaopay2025!' kpsdb < kpsdb_inserts.sql;




