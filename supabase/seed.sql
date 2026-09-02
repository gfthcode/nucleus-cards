insert into public.draft_classes(year,label,status,data_completeness) values
(1984,'1984 Draft Class','historical',70),(2003,'2003 Draft Class','historical',88),(2009,'2009 Draft Class','historical',91),(2017,'2017 Draft Class','historical',92),(2018,'2018 Draft Class','historical',91),(2020,'2020 Draft Class','historical',92),(2021,'2021 Draft Class','historical',91),(2022,'2022 Draft Class','historical',93),(2023,'2023 Draft Class','historical',95),(2024,'2024 Draft Class','historical',82),(2025,'2025 Draft Class','active',72),(2026,'2026 Draft Class','active',48)
on conflict(year) do nothing;

insert into public.teams(slug,abbreviation,name,city,conference,division) values
('atlanta-hawks','ATL','亚特兰大老鹰','Atlanta','East','Southeast'),('boston-celtics','BOS','波士顿凯尔特人','Boston','East','Atlantic'),('brooklyn-nets','BKN','布鲁克林篮网','Brooklyn','East','Atlantic'),('charlotte-hornets','CHA','夏洛特黄蜂','Charlotte','East','Southeast'),('chicago-bulls','CHI','芝加哥公牛','Chicago','East','Central'),('cleveland-cavaliers','CLE','克利夫兰骑士','Cleveland','East','Central'),('dallas-mavericks','DAL','达拉斯独行侠','Dallas','West','Southwest'),('denver-nuggets','DEN','丹佛掘金','Denver','West','Northwest'),('detroit-pistons','DET','底特律活塞','Detroit','East','Central'),('golden-state-warriors','GSW','金州勇士','San Francisco','West','Pacific'),('houston-rockets','HOU','休斯顿火箭','Houston','West','Southwest'),('indiana-pacers','IND','印第安纳步行者','Indianapolis','East','Central'),('la-clippers','LAC','洛杉矶快船','Los Angeles','West','Pacific'),('los-angeles-lakers','LAL','洛杉矶湖人','Los Angeles','West','Pacific'),('memphis-grizzlies','MEM','孟菲斯灰熊','Memphis','West','Southwest'),('miami-heat','MIA','迈阿密热火','Miami','East','Southeast'),('milwaukee-bucks','MIL','密尔沃基雄鹿','Milwaukee','East','Central'),('minnesota-timberwolves','MIN','明尼苏达森林狼','Minneapolis','West','Northwest'),('new-orleans-pelicans','NOP','新奥尔良鹈鹕','New Orleans','West','Southwest'),('new-york-knicks','NYK','纽约尼克斯','New York','East','Atlantic'),('oklahoma-city-thunder','OKC','俄克拉荷马城雷霆','Oklahoma City','West','Northwest'),('orlando-magic','ORL','奥兰多魔术','Orlando','East','Southeast'),('philadelphia-76ers','PHI','费城76人','Philadelphia','East','Atlantic'),('phoenix-suns','PHX','菲尼克斯太阳','Phoenix','West','Pacific'),('portland-trail-blazers','POR','波特兰开拓者','Portland','West','Northwest'),('sacramento-kings','SAC','萨克拉门托国王','Sacramento','West','Pacific'),('san-antonio-spurs','SAS','圣安东尼奥马刺','San Antonio','West','Southwest'),('toronto-raptors','TOR','多伦多猛龙','Toronto','East','Atlantic'),('utah-jazz','UTA','犹他爵士','Salt Lake City','West','Northwest'),('washington-wizards','WAS','华盛顿奇才','Washington','East','Southeast')
on conflict(slug) do nothing;

insert into public.players(external_key,name,display_name_zh,position,draft_year,draft_pick,current_team_id,cohort,is_core_rookie,is_role_player,is_market_active,is_trade_hot,is_signing_hot,active)
select v.external_key,v.name,v.display_name_zh,v.position,v.draft_year,v.draft_pick,t.id,v.cohort::public.player_cohort,v.is_core_rookie,v.is_role_player,true,v.is_trade_hot,v.is_signing_hot,v.active
from (values
('demo-anthony-edwards','Anthony Edwards','安东尼·爱德华兹','G',2020,1,'MIN','young_core',false,false,false,false,true),
('demo-tyrese-haliburton','Tyrese Haliburton','泰瑞斯·哈利伯顿','G',2020,12,'IND','young_core',false,false,false,false,true),
('demo-cade-cunningham','Cade Cunningham','凯德·坎宁安','G',2021,1,'DET','young_core',false,false,false,false,true),
('demo-scottie-barnes','Scottie Barnes','斯科蒂·巴恩斯','F',2021,4,'TOR','young_core',false,false,false,false,true),
('demo-paolo-banchero','Paolo Banchero','保罗·班凯罗','F',2022,1,'ORL','recent_rookie',false,false,false,false,true),
('demo-chet-holmgren','Chet Holmgren','切特·霍姆格伦','C',2022,2,'OKC','recent_rookie',false,false,false,false,true),
('demo-victor-wembanyama','Victor Wembanyama','维克托·文班亚马','C',2023,1,'SAS','recent_rookie',false,false,false,false,true),
('demo-brandon-miller','Brandon Miller','布兰登·米勒','F',2023,2,'CHA','recent_rookie',false,false,true,false,true),
('demo-zaccharie-risacher','Zaccharie Risacher','扎卡里·里萨谢','F',2024,1,'ATL','recent_rookie',false,false,false,false,true),
('demo-alex-sarr','Alex Sarr','亚历克斯·萨尔','C',2024,2,'WAS','recent_rookie',false,false,false,false,true),
('demo-cooper-flagg','Cooper Flagg','库珀·弗拉格','F',2025,1,'DAL','core_rookie',true,false,false,false,true),
('demo-aj-dybantsa','A.J. Dybantsa','A.J. 迪班萨','F',2026,1,'WAS','core_rookie',true,false,false,false,true),
('demo-derrick-white','Derrick White','德里克·怀特','G',2017,29,'BOS','prime',false,true,false,true,true),
('demo-mikal-bridges','Mikal Bridges','米卡尔·布里奇斯','F',2018,10,'NYK','prime',false,true,true,false,true),
('demo-stephen-curry','Stephen Curry','斯蒂芬·库里','G',2009,7,'GSW','veteran',false,false,false,false,true),
('demo-michael-jordan','Michael Jordan','迈克尔·乔丹','G',1984,3,null,'retired_legend',false,false,false,false,false)
) as v(external_key,name,display_name_zh,position,draft_year,draft_pick,team_abbreviation,cohort,is_core_rookie,is_role_player,is_trade_hot,is_signing_hot,active)
left join public.teams t on t.abbreviation=v.team_abbreviation
on conflict(external_key) do update set
cohort=excluded.cohort,is_core_rookie=excluded.is_core_rookie,is_role_player=excluded.is_role_player,is_trade_hot=excluded.is_trade_hot,is_signing_hot=excluded.is_signing_hot,updated_at=now();

insert into public.brands(name,license_type,license_valid_from,license_valid_to,notes) values
('Topps','NBA/NBPA official exclusive','2025-07-01',null,'2025—26 赛季起的授权期需按正式合同更新'),
('Panini','Modern inventory coverage','2009-01-01','2025-06-30','主要覆盖 2009—2025 现代存量卡'),
('Upper Deck','Historical',null,null,'历史品牌'),('Fleer','Historical',null,null,'历史品牌'),('SkyBox','Historical',null,null,'历史品牌'),('Bowman','Historical',null,null,'历史品牌')
on conflict(name) do nothing;

insert into public.product_lines(brand_id,name,active_from,active_to,authorization_note)
select b.id,v.name,v.active_from,v.active_to,v.note from public.brands b join (values
('Topps','Topps Basketball',2025,null,'official era'),('Topps','Topps Chrome Basketball',2025,null,'official era'),('Topps','Topps Finest',2025,null,'official era'),('Topps','Topps Midnight',2025,null,'official era'),('Topps','Topps NOW NBA',2025,null,'official era'),('Topps','Topps Hoops',2025,null,'official era'),('Topps','Rookie Debut Patch',2025,null,'official era'),('Topps','NBA Match Attax',2025,null,'China market'),
('Panini','Prizm',2012,2025,'modern inventory'),('Panini','Select',2012,2025,'modern inventory'),('Panini','Donruss Optic',2016,2025,'modern inventory'),('Panini','Mosaic',2016,2025,'modern inventory'),('Panini','National Treasures',2009,2025,'modern inventory'),('Panini','Flawless',2012,2025,'modern inventory'),('Panini','Immaculate',2012,2025,'modern inventory'),('Panini','Contenders',2009,2025,'modern inventory'),('Panini','Court Kings',2009,2025,'modern inventory'),('Panini','Donruss',2009,2025,'modern inventory'),('Panini','Hoops',2009,2025,'modern inventory'),('Panini','Spectra',2013,2025,'modern inventory'),('Panini','Origins',2016,2025,'modern inventory'),('Panini','One and One',2019,2025,'modern inventory')
) as v(brand,name,active_from,active_to,note) on b.name=v.brand
on conflict(brand_id,name) do nothing;

insert into public.grading_companies(code,name,scale_max) values ('PSA','Professional Sports Authenticator',10),('BGS','Beckett Grading Services',10),('SGC','Sportscard Guaranty',10),('CGC','Certified Guaranty Company',10) on conflict(code) do nothing;

insert into public.data_sources(key,name,region,enabled,requires_api_key,supports_listings,supports_sales,authorization,error_message) values
('cardhobby','卡淘 CardHobby','CN',false,false,false,false,'adapter-only','等待商业授权或 CSV 导入'),('xianyu','闲鱼','CN',false,false,false,false,'adapter-only','未授权，不进行自动采集'),('carousell-hk','Carousell Hong Kong','HK',false,false,false,false,'adapter-only','未授权，仅保留适配器'),('ebay','eBay Browse API','INTL',false,true,true,false,'official-api','缺少 EBAY_CLIENT_ID'),('community','社区提交','COMMUNITY',true,false,false,true,'community',null),('demo','Nucleus 演示源','COMMUNITY',true,false,true,true,'demo',null)
on conflict(key) do nothing;

-- Demo auth users are intentionally not inserted here. Use Supabase Auth or local demo mode.
