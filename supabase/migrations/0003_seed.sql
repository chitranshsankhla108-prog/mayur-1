-- ============================================================
-- 0003_seed.sql
-- Seed categories + preset templates + template fields.
-- Idempotent: guarded by slugs / not-exists checks.
-- image_url is left null on purpose — the storefront renders a
-- consistent styled placeholder per category until real images are set.
-- ============================================================

insert into public.categories (name, slug, description, icon, sort_order, is_active) values
  ('Inverters','inverters','Pure & modified sine wave inverters for home and business.','Zap',1,true),
  ('Batteries','batteries','Tubular, flat-plate and lithium batteries built to last.','BatteryCharging',2,true),
  ('CCTV Cameras','cctv-cameras','HD & IP security cameras for round-the-clock protection.','Cctv',3,true),
  ('DVR / NVR','dvr-nvr','Recorders that keep every frame safe and searchable.','HardDrive',4,true),
  ('Solar Products','solar-products','Panels, controllers and kits for clean energy savings.','Sun',5,true),
  ('Electrical Accessories','electrical-accessories','Cables, switches and the essentials every install needs.','Plug',6,true),
  ('Networking Devices','networking-devices','Routers, switches and PoE gear for reliable connectivity.','Router',7,true)
on conflict (slug) do nothing;

insert into public.product_templates (category_id, name, description, is_preset)
select c.id, t.name, t.description, true
from (values
  ('inverters','Inverter','Specs for home & commercial inverters.'),
  ('batteries','Battery','Specs for tubular / lithium batteries.'),
  ('cctv-cameras','CCTV Camera','Specs for security cameras.'),
  ('dvr-nvr','DVR / NVR','Specs for recorders.'),
  ('solar-products','Solar Product','Specs for panels & controllers.'),
  ('electrical-accessories','Electrical Accessory','Specs for cables & accessories.')
) as t(slug,name,description)
join public.categories c on c.slug = t.slug
where not exists (select 1 from public.product_templates pt where pt.name = t.name);

insert into public.template_fields (template_id, label, field_key, field_type, placeholder, options, is_required, sort_order)
select pt.id, f.label, f.field_key, f.field_type::field_type, f.placeholder,
       case when f.options = '' then null else f.options::jsonb end, f.is_required, f.sort_order
from public.product_templates pt
join (values
  ('Inverter','VA Rating','va_rating','text','e.g. 1100VA','',true,1),
  ('Inverter','Wave Type','wave_type','select','','["Pure Sine Wave","Modified Sine Wave"]',true,2),
  ('Inverter','Battery Support','battery_support','text','e.g. Single / Double','',false,3),
  ('Inverter','Input Voltage','input_voltage','text','e.g. 100V - 290V','',false,4),
  ('Inverter','Output Voltage','output_voltage','text','e.g. 230V','',false,5),
  ('Inverter','Warranty','warranty','text','e.g. 2 Years','',false,6),
  ('Battery','Capacity','capacity','text','e.g. 150Ah','',true,1),
  ('Battery','Voltage','voltage','text','e.g. 12V','',false,2),
  ('Battery','Technology','technology','select','','["Tubular","Flat Plate","Lithium","SMF"]',false,3),
  ('Battery','Backup Time','backup_time','text','e.g. 4-6 hours','',false,4),
  ('Battery','Weight','weight','text','e.g. 48 kg','',false,5),
  ('Battery','Warranty','warranty','text','e.g. 36 + 24 Months','',false,6),
  ('CCTV Camera','Resolution','resolution','select','','["2MP","3MP","5MP","8MP (4K)"]',true,1),
  ('CCTV Camera','Lens Type','lens_type','text','e.g. 3.6mm Fixed','',false,2),
  ('CCTV Camera','Night Vision','night_vision','text','e.g. Up to 30m IR','',false,3),
  ('CCTV Camera','Indoor / Outdoor','placement','select','','["Indoor","Outdoor","Indoor/Outdoor"]',false,4),
  ('CCTV Camera','Storage Support','storage_support','text','e.g. up to 256GB / NVR','',false,5),
  ('CCTV Camera','Warranty','warranty','text','e.g. 2 Years','',false,6),
  ('DVR / NVR','Channels','channels','select','','["4 Channel","8 Channel","16 Channel","32 Channel"]',true,1),
  ('DVR / NVR','Type','type','select','','["DVR","NVR"]',false,2),
  ('DVR / NVR','Max Resolution','max_resolution','text','e.g. 5MP Lite','',false,3),
  ('DVR / NVR','Storage Support','storage_support','text','e.g. 1 SATA up to 10TB','',false,4),
  ('DVR / NVR','Warranty','warranty','text','e.g. 2 Years','',false,5),
  ('Solar Product','Wattage / Rating','wattage','text','e.g. 165W / 20A','',true,1),
  ('Solar Product','Type','type','select','','["Mono PERC","Polycrystalline","MPPT Controller","PWM Controller"]',false,2),
  ('Solar Product','Voltage','voltage','text','e.g. 12V/24V','',false,3),
  ('Solar Product','Efficiency','efficiency','text','e.g. 21%','',false,4),
  ('Solar Product','Warranty','warranty','text','e.g. 25 Years','',false,5),
  ('Electrical Accessory','Material','material','text','e.g. 99.97% Copper','',false,1),
  ('Electrical Accessory','Size / Gauge','size','text','e.g. 1.5 sq mm','',false,2),
  ('Electrical Accessory','Length','length','text','e.g. 90m coil','',false,3),
  ('Electrical Accessory','Rating','rating','text','e.g. 1100V','',false,4),
  ('Electrical Accessory','Warranty','warranty','text','e.g. 1 Year','',false,5)
) as f(tpl,label,field_key,field_type,placeholder,options,is_required,sort_order)
  on f.tpl = pt.name
where not exists (
  select 1 from public.template_fields tf where tf.template_id = pt.id and tf.field_key = f.field_key
);
