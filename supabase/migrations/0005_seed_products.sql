-- ============================================================
-- 0005_seed_products.sql
-- Sample storefront products + specs. Idempotent (keyed by slug).
-- Links to existing categories (by slug) and templates (by name) — no
-- hardcoded UUIDs, so it is safe across environments.
-- ============================================================

do $$
declare
  r record;
  pid uuid;
  items jsonb := '[
    {"slug":"150ah-tubular-battery","title":"150Ah Tubular Battery","cat":"batteries","tpl":"Battery","brand":"Mayur PowerMax","sku":"ME-1001","price":13499,"cmp":15999,"stock":40,"warranty":"36 + 24 Months","feat":true,
      "short":"Heavy-duty tubular battery with long backup and life.",
      "desc":"The 150Ah tubular battery is engineered for deep, repeated discharge cycles, ideal for areas with frequent and long power cuts. Low maintenance and built for Indian conditions.",
      "specs":[["capacity","Capacity","150Ah"],["voltage","Voltage","12V"],["technology","Technology","Tubular"],["backup_time","Backup Time","5-7 hours"],["weight","Weight","48 kg"],["warranty","Warranty","36 + 24 Months"]]},
    {"slug":"1100va-sine-wave-inverter","title":"1100VA Pure Sine Wave Inverter","cat":"inverters","tpl":"Inverter","brand":"Mayur PowerMax","sku":"ME-1002","price":8999,"cmp":10499,"stock":30,"warranty":"2 Years","feat":true,
      "short":"Pure sine wave output safe for sensitive electronics.",
      "desc":"A 1100VA pure sine wave inverter delivering clean, grid-quality power for home appliances, computers and routers. Smart LED display and intelligent charging.",
      "specs":[["va_rating","VA Rating","1100VA"],["wave_type","Wave Type","Pure Sine Wave"],["battery_support","Battery Support","Single Battery"],["input_voltage","Input Voltage","100V - 290V"],["output_voltage","Output Voltage","230V"],["warranty","Warranty","2 Years"]]},
    {"slug":"5mp-cctv-camera","title":"5MP HD Dome CCTV Camera","cat":"cctv-cameras","tpl":"CCTV Camera","brand":"Mayur Vision","sku":"ME-1003","price":2299,"cmp":2899,"stock":60,"warranty":"2 Years","feat":true,
      "short":"Crisp 5MP footage with 30m color night vision.",
      "desc":"Capture every detail with this 5MP dome camera featuring smart IR night vision up to 30 metres, weatherproof housing and easy NVR/DVR integration.",
      "specs":[["resolution","Resolution","5MP"],["lens_type","Lens Type","3.6mm Fixed"],["night_vision","Night Vision","Up to 30m IR"],["placement","Indoor / Outdoor","Indoor/Outdoor"],["storage_support","Storage Support","NVR/DVR"],["warranty","Warranty","2 Years"]]},
    {"slug":"8-channel-dvr","title":"8 Channel 5MP DVR","cat":"dvr-nvr","tpl":"DVR / NVR","brand":"Mayur Vision","sku":"ME-1004","price":4499,"cmp":5299,"stock":22,"warranty":"2 Years","feat":true,
      "short":"Record up to 8 cameras with H.265+ compression.",
      "desc":"An 8 channel DVR supporting 5MP Lite recording with efficient H.265+ compression to maximise storage. Mobile app access for live view from anywhere.",
      "specs":[["channels","Channels","8 Channel"],["type","Type","DVR"],["max_resolution","Max Resolution","5MP Lite"],["storage_support","Storage Support","1 SATA up to 10TB"],["warranty","Warranty","2 Years"]]},
    {"slug":"solar-charge-controller-20a","title":"Solar Charge Controller 20A MPPT","cat":"solar-products","tpl":"Solar Product","brand":"Mayur Solar","sku":"ME-1005","price":1899,"cmp":2499,"stock":35,"warranty":"1 Year","feat":true,
      "short":"MPPT controller squeezing more from every panel.",
      "desc":"A 20A MPPT solar charge controller that maximises harvest from your solar panels with up to 99% tracking efficiency and full battery protection.",
      "specs":[["wattage","Wattage / Rating","20A"],["type","Type","MPPT Controller"],["voltage","Voltage","12V/24V Auto"],["efficiency","Efficiency","99%"],["warranty","Warranty","1 Year"]]},
    {"slug":"copper-electrical-cable","title":"Copper Electrical Cable 1.5 sq mm","cat":"electrical-accessories","tpl":"Electrical Accessory","brand":"Mayur Wires","sku":"ME-1006","price":1299,"cmp":1599,"stock":100,"warranty":"1 Year","feat":true,
      "short":"99.97% pure copper FR cable, 90m coil.",
      "desc":"Flame-retardant 1.5 sq mm copper cable made from 99.97% pure electrolytic copper for safe, low-loss wiring. ISI marked and built for long life.",
      "specs":[["material","Material","99.97% Copper"],["size","Size / Gauge","1.5 sq mm"],["length","Length","90m coil"],["rating","Rating","1100V"],["warranty","Warranty","1 Year"]]},
    {"slug":"cat6-networking-cable","title":"Cat6 Networking Cable 305m","cat":"networking-devices","tpl":null,"brand":"Mayur Connect","sku":"ME-1007","price":4999,"cmp":5999,"stock":45,"warranty":"2 Years","feat":true,
      "short":"Pure copper Cat6 LAN cable, 305m box, 23 AWG.",
      "desc":"High-performance Cat6 networking cable supporting up to 1 Gbps over 100m. 23 AWG solid bare copper conductors for CCTV/PoE and office LAN runs.",
      "specs":[]}
  ]'::jsonb;
begin
  for r in select * from jsonb_array_elements(items) as x(v) loop
    if not exists (select 1 from products where slug = (r.v->>'slug')) then
      insert into products (title, slug, sku, brand, category_id, template_id,
        short_description, description, price, compare_at_price, stock_quantity,
        warranty, is_featured, is_active)
      values (
        r.v->>'title', r.v->>'slug', r.v->>'sku', r.v->>'brand',
        (select id from categories where slug = (r.v->>'cat')),
        case when r.v->>'tpl' is null then null
             else (select id from product_templates where name = (r.v->>'tpl') limit 1) end,
        r.v->>'short', r.v->>'desc',
        (r.v->>'price')::numeric, (r.v->>'cmp')::numeric, (r.v->>'stock')::int,
        r.v->>'warranty', (r.v->>'feat')::boolean, true
      ) returning id into pid;

      insert into product_specs (product_id, field_key, label, value)
      select pid, s->>0, s->>1, s->>2
      from jsonb_array_elements(r.v->'specs') as s;
    end if;
  end loop;
end $$;
