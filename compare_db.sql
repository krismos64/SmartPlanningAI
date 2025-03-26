SELECT table_name, column_name, column_type, is_nullable, column_key, column_default, extra FROM information_schema.columns WHERE table_schema = 'smartplanningai' ORDER BY table_name, ordinal_position;
SELECT t.table_name, k.column_name, k.constraint_name, k.referenced_table_name, k.referenced_column_name FROM information_schema.table_constraints t JOIN information_schema.key_column_usage k USING (constraint_name, table_schema, table_name) WHERE t.constraint_type = 'FOREIGN KEY' AND t.table_schema = 'smartplanningai' ORDER BY t.table_name, k.column_name;
SHOW TRIGGERS FROM smartplanningai;
SHOW PROCEDURE STATUS WHERE db = 'smartplanningai';
