-- 产品型号增加计量单位；历史记录保持 NULL，避免推断/伪造其实际单位。
ALTER TABLE md_product ADD COLUMN unit VARCHAR(32);
