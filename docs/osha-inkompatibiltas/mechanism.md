

PENCARIAN ATURAN INKOMPATIBILITAS
```sql
-- Diberikan dua input GHS ID dari aplikasi: $input_1 dan $input_2
SELECT hazard_description, risk_level, action_required
FROM osha_incompatibility_rules
WHERE class_a_id = LEAST($1, $2)
  AND class_b_id = GREATEST($1, $2);
```
