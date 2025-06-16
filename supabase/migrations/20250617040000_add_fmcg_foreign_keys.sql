-- Add foreign key constraints to transaction_items_fmcg

ALTER TABLE transaction_items_fmcg
ADD CONSTRAINT fk_transaction_items_transaction
FOREIGN KEY (transaction_id)
REFERENCES transactions_fmcg (id);

ALTER TABLE transaction_items_fmcg
ADD CONSTRAINT fk_transaction_items_products
FOREIGN KEY (product_id)
REFERENCES products (id); 